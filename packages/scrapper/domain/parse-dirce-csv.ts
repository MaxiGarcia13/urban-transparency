import type {
  DirceSectorCode,
  MunicipalBusinessStats,
} from '@urban-transparency/shared';

const MUNICIPALITY_FIELD_PATTERN = /^(\d{5})\s+/;
const PERIOD_YEAR_PATTERN = /^\d{4}$/;

const DIRCE_SECTOR_LABEL_TO_CODE: ReadonlyMap<string, DirceSectorCode> = new Map([
  ['total', 'TOTAL'],
  ['industria', 'INDUSTRIA'],
  ['f construccion', 'F'],
  ['comercio, transporte y hosteleria', 'GHI'],
  ['j informacion y comunicaciones', 'J'],
  ['k actividades financieras y de seguros', 'K'],
  ['l actividades inmobiliarias', 'L'],
  ['mn actividades profesionales y tecnicas', 'MN'],
  ['educacion, sanidad y servicios sociales', 'PQS'],
  ['otros servicios personales', 'S'],
  ['total servicios', 'SERVICES'],
]);

function normalizeLabel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('es')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseMunicipalityCode(municipalityField: string): string | null {
  const match = MUNICIPALITY_FIELD_PATTERN.exec(municipalityField.trim());
  return match?.[1] ?? null;
}

function parseSectorCode(sectorLabel: string): DirceSectorCode | null {
  return DIRCE_SECTOR_LABEL_TO_CODE.get(normalizeLabel(sectorLabel)) ?? null;
}

function parsePeriodYear(raw: string): number | null {
  const trimmed = raw.trim();
  if (!PERIOD_YEAR_PATTERN.test(trimmed)) {
    return null;
  }
  return Number(trimmed);
}

function parseActiveBusinessCount(raw: string): number | null {
  const trimmed = raw.trim();
  if (
    !trimmed
    || trimmed === '.'
    || trimmed === '..'
    || trimmed === '-'
    || trimmed === '""'
    || trimmed === '…'
  ) {
    return null;
  }

  // Spanish thousands separator: 11.655 → 11655
  const normalized = trimmed.replace(/\./g, '');
  if (!/^\d+$/.test(normalized)) {
    return null;
  }
  return Number(normalized);
}

function splitCsvLine(line: string): string[] {
  return line.split(';');
}

export function parseDirceCsv(
  csvText: string,
  options: {
    provinceCodes: readonly string[];
    fetchedAt: string;
  },
): MunicipalBusinessStats[] {
  const provincePrefixes = [...new Set(options.provinceCodes)];
  const lines = csvText.replace(/^\uFEFF/, '').split(/\r?\n/);
  if (lines.length === 0) {
    throw new Error('DIRCE CSV is empty');
  }

  const header = splitCsvLine(lines[0] ?? '');
  const expectedHeader = [
    'Totales Territoriales',
    'Provincias',
    'Municipios',
    'Grupos CNAE',
    'Periodo',
    'Total',
  ];
  const normalizedHeader = header.map((part) => part.trim());
  if (
    normalizedHeader.length < expectedHeader.length
    || expectedHeader.some((part, index) => normalizedHeader[index] !== part)
  ) {
    throw new Error(
      `Unexpected DIRCE CSV header: ${normalizedHeader.join(';')}`,
    );
  }

  const rows: MunicipalBusinessStats[] = [];
  const seen = new Set<string>();

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index]?.trim();
    if (!line) {
      continue;
    }

    const columns = splitCsvLine(line);
    if (columns.length < 6) {
      continue;
    }

    const municipalityField = columns[2]?.trim() ?? '';
    if (!municipalityField) {
      continue;
    }

    const municipalityCode = parseMunicipalityCode(municipalityField);
    if (!municipalityCode) {
      continue;
    }
    if (
      !provincePrefixes.some((provinceCode) =>
        municipalityCode.startsWith(provinceCode),
      )
    ) {
      continue;
    }

    const sectorCode = parseSectorCode(columns[3] ?? '');
    if (!sectorCode) {
      continue;
    }

    const periodYear = parsePeriodYear(columns[4] ?? '');
    if (periodYear == null) {
      continue;
    }

    const key = `${municipalityCode}:${periodYear}:${sectorCode}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    rows.push({
      municipalityCode,
      periodYear,
      sectorCode,
      activeBusinessCount: parseActiveBusinessCount(columns[5] ?? ''),
      sourceSystem: 'ine-dirce',
      fetchedAt: options.fetchedAt,
    });
  }

  return rows;
}
