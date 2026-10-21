import type { PublicContract } from '@urban-transparency/shared';
import {
  parsePublicContractStatus,

} from '@urban-transparency/shared';
import { XMLParser } from 'fast-xml-parser';

import { asArray, xmlText } from '../utils/xml-text';

const atomParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  trimValues: true,
});

export interface ParsedPlacspAtomPage {
  contracts: PublicContract[];
  nextPageUrl: string | null;
}

function findNif(party: Record<string, unknown> | undefined): string | null {
  if (!party) {
    return null;
  }
  for (const identification of asArray(party.PartyIdentification)) {
    const idNode = identification as Record<string, unknown>;
    const id = idNode.ID as Record<string, unknown> | string | undefined;
    const scheme = typeof id === 'object' ? xmlText(id['@_schemeName']) : null;
    if (scheme === 'NIF') {
      return xmlText(id);
    }
  }
  return null;
}

function findPartyName(party: Record<string, unknown> | undefined): string | null {
  if (!party) {
    return null;
  }
  const partyName = asArray(party.PartyName)[0] as Record<string, unknown> | undefined;
  return xmlText(partyName?.Name);
}

function findLinkHref(entry: Record<string, unknown>): string | null {
  for (const link of asArray(entry.link)) {
    const href = xmlText((link as Record<string, unknown>)['@_href']);
    if (href) {
      return href.replaceAll('&amp;', '&');
    }
  }
  return null;
}

function findNextPageUrl(feed: Record<string, unknown>): string | null {
  for (const link of asArray(feed.link)) {
    const linkNode = link as Record<string, unknown>;
    if (xmlText(linkNode['@_rel']) === 'next') {
      const href = xmlText(linkNode['@_href']);
      return href ? href.replaceAll('&amp;', '&') : null;
    }
  }
  return null;
}

function findRealizedLocation(status: Record<string, unknown>): Record<string, unknown> | undefined {
  const project = status.ProcurementProject as Record<string, unknown> | undefined;
  if (!project) {
    return undefined;
  }
  return asArray(project.RealizedLocation)[0] as Record<string, unknown> | undefined;
}

function findExecutionAddress(location: Record<string, unknown> | undefined): {
  city: string | null;
  postalCode: string | null;
  addressLine: string | null;
} {
  if (!location) {
    return { city: null, postalCode: null, addressLine: null };
  }

  const address = location.Address as Record<string, unknown> | undefined;
  const addressLineNode = asArray(address?.AddressLine)[0] as Record<string, unknown> | undefined;

  return {
    city: xmlText(address?.CityName) ?? xmlText(location.CountrySubentity),
    postalCode: xmlText(address?.PostalZone),
    addressLine: xmlText(addressLineNode?.Line) ?? xmlText(address?.StreetName),
  };
}

function findNutsCode(location: Record<string, unknown> | undefined): string | null {
  if (!location) {
    return null;
  }
  return xmlText(location.CountrySubentityCode);
}

function findAwardedAmountEur(status: Record<string, unknown>): number | null {
  const tenderResult = status.TenderResult as Record<string, unknown> | undefined;
  const awardedProject = tenderResult?.AwardedTenderedProject as Record<string, unknown> | undefined;
  const payable = awardedProject?.PayableAmount;
  const payableText = xmlText(payable);
  if (payableText != null) {
    const amount = Number(payableText);
    return Number.isFinite(amount) ? amount : null;
  }

  const project = status.ProcurementProject as Record<string, unknown> | undefined;
  const budget = project?.BudgetAmount as Record<string, unknown> | undefined;
  const taxExclusive = xmlText(budget?.TaxExclusiveAmount);
  if (taxExclusive == null) {
    return null;
  }
  const amount = Number(taxExclusive);
  return Number.isFinite(amount) ? amount : null;
}

function findWinningParty(status: Record<string, unknown>): {
  name: string | null;
  nif: string | null;
} {
  const tenderResult = status.TenderResult as Record<string, unknown> | undefined;
  const winningParty = asArray(tenderResult?.WinningParty)[0] as Record<string, unknown> | undefined;
  return {
    name: findPartyName(winningParty),
    nif: findNif(winningParty),
  };
}

function parseEntry(
  entry: Record<string, unknown>,
  fetchedAt: string,
): PublicContract | null {
  const status = entry.ContractFolderStatus as Record<string, unknown> | undefined;
  if (!status) {
    return null;
  }

  const id = xmlText(entry.id);
  const title = xmlText(entry.title);
  if (!id || !title) {
    return null;
  }

  const contractingParty = status.LocatedContractingParty as Record<string, unknown> | undefined;
  const party = contractingParty?.Party as Record<string, unknown> | undefined;
  const contractingPartyName = findPartyName(party);
  if (!contractingPartyName) {
    return null;
  }

  const location = findRealizedLocation(status);
  const executionAddress = findExecutionAddress(location);
  const awardee = findWinningParty(status);

  return {
    id,
    contractFolderId: xmlText(status.ContractFolderID),
    title,
    status: parsePublicContractStatus(xmlText(status.ContractFolderStatusCode)),
    contractingPartyName,
    contractingPartyNif: findNif(party),
    awardedAmountEur: findAwardedAmountEur(status),
    awardeeName: awardee.name,
    awardeeNif: awardee.nif,
    executionCity: executionAddress.city,
    postalCode: executionAddress.postalCode,
    executionAddressLine: executionAddress.addressLine,
    nutsCode: findNutsCode(location),
    awardedAt: xmlText((status.TenderResult as Record<string, unknown> | undefined)?.AwardDate),
    detailUrl: findLinkHref(entry),
    municipalityCode: null,
    neighborhoodId: null,
    executionLongitude: null,
    executionLatitude: null,
    sourceSystem: 'placsp',
    sourceEntryUpdatedAt: xmlText(entry.updated),
    fetchedAt,
  };
}

/** Parse one Atom XML document into contracts and the next page URL. */
export function parsePlacspAtomFeed(xml: string, fetchedAt: string): ParsedPlacspAtomPage {
  const parsed = atomParser.parse(xml) as { feed?: Record<string, unknown> };
  const feed = parsed.feed;
  if (!feed) {
    return { contracts: [], nextPageUrl: null };
  }

  const contracts: PublicContract[] = [];
  for (const entry of asArray(feed.entry)) {
    const contract = parseEntry(entry as Record<string, unknown>, fetchedAt);
    if (contract) {
      contracts.push(contract);
    }
  }

  return {
    contracts,
    nextPageUrl: findNextPageUrl(feed),
  };
}
