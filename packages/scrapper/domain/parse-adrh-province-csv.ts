import type { MunicipalIncomeStats } from '@urban-transparency/shared';

import { resolveProvinceCodeFromIneLabel } from '../config/ine-province-labels';
import { parseAdrhEuroAmount } from './parse-adrh-csv';

const PERIOD_YEAR_PATTERN = /^\d{4}$/;

// INE ADRH indicator labels (source CSV is Spanish).
const INE_MEAN_NET_INCOME_PER_PERSON_LABEL = 'renta neta media por persona';
const INE_MEAN_NET_INCOME_PER_HOUSEHOLD_LABEL = 'renta neta media por hogar';

type IncomeMeasure = 'person' | 'household';

interface AggregateBucket {
  provinceCode: string;
  periodYear: number;
  person: number | null;
  household: number | null;
}

function normalizeLabel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('es')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePeriodYear(raw: string): number | null {
  const trimmed = raw.trim();
  if (!PERIOD_YEAR_PATTERN.test(trimmed)) {
    return null;
  }
  return Number(trimmed);
}

function parseIncomeMeasure(indicatorLabel: string): IncomeMeasure | null {
  const normalized = normalizeLabel(indicatorLabel);
  if (normalized === INE_MEAN_NET_INCOME_PER_PERSON_LABEL) {
    return 'person';
  }
  if (normalized === INE_MEAN_NET_INCOME_PER_HOUSEHOLD_LABEL) {
    return 'household';
  }
  return null;
}

function splitCsvLine(line: string): string[] {
  return line.split(';');
}

export function parseAdrhProvinceCsv(
  csvText: string,
  options: {
    provinceCodes: readonly string[];
    fetchedAt: string;
  },
): MunicipalIncomeStats[] {
  const provinceCodeSet = new Set(options.provinceCodes);
  const lines = csvText.replace(/^\uFEFF/, '').split(/\r?\n/);
  if (lines.length === 0) {
    throw new Error('ADRH province CSV is empty');
  }

  const header = splitCsvLine(lines[0] ?? '').map((part) => part.trim());
  const expectedHeader = [
    'Total Nacional',
    'Comunidades y Ciudades Autónomas',
    'Provincias',
    'Islas',
    'Indicadores de renta media',
    'Periodo',
    'Total',
  ];
  if (
    header.length < expectedHeader.length
    || expectedHeader.some((part, index) => header[index] !== part)
  ) {
    throw new Error(`Unexpected ADRH province CSV header: ${header.join(';')}`);
  }

  const buckets = new Map<string, AggregateBucket>();

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index]?.trim();
    if (!line) {
      continue;
    }

    const columns = splitCsvLine(line);
    if (columns.length < 7) {
      continue;
    }

    const provinceLabel = columns[2]?.trim() ?? '';
    if (!provinceLabel) {
      continue;
    }

    const provinceCode = resolveProvinceCodeFromIneLabel(provinceLabel);
    if (provinceCode == null || !provinceCodeSet.has(provinceCode)) {
      continue;
    }

    const measure = parseIncomeMeasure(columns[4] ?? '');
    if (!measure) {
      continue;
    }

    const periodYear = parsePeriodYear(columns[5] ?? '');
    if (periodYear == null) {
      continue;
    }

    const amount = parseAdrhEuroAmount(columns[6] ?? '');
    if (amount == null) {
      continue;
    }

    const key = `${provinceCode}:${periodYear}`;
    const bucket = buckets.get(key) ?? {
      provinceCode,
      periodYear,
      person: null,
      household: null,
    };
    if (measure === 'person') {
      bucket.person = amount;
    } else {
      bucket.household = amount;
    }
    buckets.set(key, bucket);
  }

  return [...buckets.values()]
    .map((bucket) => ({
      // Province aggregate keyed as 2-digit INE code (not a municipality).
      municipalityCode: bucket.provinceCode,
      periodYear: bucket.periodYear,
      meanNetIncomePerPerson: bucket.person,
      meanNetIncomePerHousehold: bucket.household,
      sourceSystem: 'ine-adrh' as const,
      fetchedAt: options.fetchedAt,
    }))
    .sort((left, right) => {
      if (left.periodYear !== right.periodYear) {
        return right.periodYear - left.periodYear;
      }
      return left.municipalityCode.localeCompare(right.municipalityCode);
    });
}
