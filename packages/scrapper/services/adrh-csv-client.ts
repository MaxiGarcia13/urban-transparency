import { ADRH_RENTA_MEDIA_TABLE_ID_BY_PROVINCE } from '../config/adrh-renta-media-table-ids';
import { delay } from '../utils/delay';
import { USER_AGENT } from '../utils/user-agent';

export const ADRH_TEMPUS_OPERATION_ID = 353;
export const ADRH_RENTA_MEDIA_TABLE_NAME
  = 'Indicadores de renta media y mediana';
export const ADRH_DIST_SECC_MUN_CODE = 'DIST-SECC-MUN';

const TEMPUS_TABLAS_OPERACION_URL
  = `https://servicios.ine.es/wstempus/js/ES/TABLAS_OPERACION/${ADRH_TEMPUS_OPERATION_ID}`;

const CSV_BDSC_URL_PREFIX = 'https://www.ine.es/jaxiT3/files/t/csv_bdsc/';

const DEFAULT_PROBE_DELAY_MS = 400;

interface TempusTable {
  Id: number;
  Nombre: string;
  Codigo: string;
}

const resolvedTableIdByProvince = new Map<string, number>(
  Object.entries(ADRH_RENTA_MEDIA_TABLE_ID_BY_PROVINCE),
);

function csvBdscUrl(tableId: number): string {
  return `${CSV_BDSC_URL_PREFIX}${tableId}.csv`;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'Accept': 'text/csv,text/plain,application/json,*/*',
      'User-Agent': USER_AGENT,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }
  return new TextDecoder('utf-8').decode(await response.arrayBuffer());
}

export async function listAdrhRentaMediaMunicipalityTableIds(): Promise<
  number[]
> {
  const raw = await fetchText(TEMPUS_TABLAS_OPERACION_URL);
  const tables = JSON.parse(raw) as TempusTable[];
  if (!Array.isArray(tables) || tables.length === 0) {
    throw new Error('ADRH TempUS table index returned no tables');
  }

  const ids = tables
    .filter(
      (table) =>
        table.Nombre === ADRH_RENTA_MEDIA_TABLE_NAME
        && table.Codigo === ADRH_DIST_SECC_MUN_CODE,
    )
    .map((table) => table.Id);

  if (ids.length === 0) {
    throw new Error(
      'No ADRH municipality renta-media tables found in TempUS index',
    );
  }

  return ids;
}

export async function peekAdrhCsvProvinceCode(
  tableId: number,
): Promise<string | null> {
  const csvText = await fetchText(csvBdscUrl(tableId));
  const lines = csvText.replace(/^\uFEFF/, '').split(/\r?\n/);
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index]?.trim();
    if (!line) {
      continue;
    }
    const municipalityField = line.split(';')[0]?.trim() ?? '';
    const match = /^(\d{5})\b/.exec(municipalityField);
    if (match?.[1]) {
      return match[1].slice(0, 2);
    }
  }
  return null;
}

export async function resolveAdrhRentaMediaTableId(
  provinceCode: string,
  options: { probeDelayMs?: number } = {},
): Promise<number> {
  const cached = resolvedTableIdByProvince.get(provinceCode);
  if (cached != null) {
    return cached;
  }

  const probeDelayMs = options.probeDelayMs ?? DEFAULT_PROBE_DELAY_MS;
  const tableIds = await listAdrhRentaMediaMunicipalityTableIds();

  for (let index = 0; index < tableIds.length; index += 1) {
    const tableId = tableIds[index];
    if (tableId == null) {
      continue;
    }

    if (index > 0) {
      await delay(probeDelayMs);
    }

    const peekedProvinceCode = await peekAdrhCsvProvinceCode(tableId);
    if (peekedProvinceCode == null) {
      continue;
    }

    resolvedTableIdByProvince.set(peekedProvinceCode, tableId);
    if (peekedProvinceCode === provinceCode) {
      return tableId;
    }
  }

  throw new Error(
    `Could not resolve ADRH renta-media table id for province ${provinceCode}`,
  );
}

export async function fetchAdrhRentaMediaCsv(
  provinceCode: string,
  options: { probeDelayMs?: number } = {},
): Promise<{ tableId: number; csvText: string }> {
  const tableId = await resolveAdrhRentaMediaTableId(provinceCode, options);
  const csvText = await fetchText(csvBdscUrl(tableId));
  return { tableId, csvText };
}
