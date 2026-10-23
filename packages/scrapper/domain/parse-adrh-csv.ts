import type { MunicipalIncomeStats } from '@urban-transparency/shared';

const MUNICIPALITY_FIELD_PATTERN = /^(\d{5})\s+/;
const PERIOD_YEAR_PATTERN = /^\d{4}$/;

// INE ADRH indicator labels (source CSV is Spanish).
const INE_MEAN_NET_INCOME_PER_PERSON_LABEL = 'renta neta media por persona';
const INE_MEAN_NET_INCOME_PER_HOUSEHOLD_LABEL = 'renta neta media por hogar';

type IncomeMeasure = 'person' | 'household';

interface AggregateBucket {
  municipalityCode: string;
  periodYear: number;
  personSum: number;
  personCount: number;
  householdSum: number;
  householdCount: number;
}

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

export function parseAdrhEuroAmount(raw: string): number | null {
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

  let normalized = trimmed;
  if (normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else {
    normalized = normalized.replace(/\./g, '');
  }

  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) {
    return null;
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function splitCsvLine(line: string): string[] {
  return line.split(';');
}

function isMunicipalityAggregateRow(
  districtField: string,
  sectionField: string,
): boolean {
  return districtField.trim() === '' && sectionField.trim() === '';
}

function emptyBucket(
  municipalityCode: string,
  periodYear: number,
): AggregateBucket {
  return {
    municipalityCode,
    periodYear,
    personSum: 0,
    personCount: 0,
    householdSum: 0,
    householdCount: 0,
  };
}

function addMeasure(
  bucket: AggregateBucket,
  measure: IncomeMeasure,
  value: number,
): void {
  if (measure === 'person') {
    bucket.personSum += value;
    bucket.personCount += 1;
    return;
  }
  bucket.householdSum += value;
  bucket.householdCount += 1;
}

function meanOrNull(sum: number, count: number): number | null {
  if (count === 0) {
    return null;
  }
  return sum / count;
}

export function parseAdrhCsv(
  csvText: string,
  options: {
    provinceCodes: readonly string[];
    fetchedAt: string;
  },
): MunicipalIncomeStats[] {
  const provincePrefixes = [...new Set(options.provinceCodes)];
  const lines = csvText.replace(/^\uFEFF/, '').split(/\r?\n/);
  if (lines.length === 0) {
    throw new Error('ADRH CSV is empty');
  }

  const header = splitCsvLine(lines[0] ?? '').map((part) => part.trim());
  const expectedPrefix = [
    'Municipios',
    'Distritos',
    'Secciones',
  ];
  if (
    header.length < 6
    || expectedPrefix.some((part, index) => header[index] !== part)
    || header[4] !== 'Periodo'
    || header[5] !== 'Total'
  ) {
    throw new Error(`Unexpected ADRH CSV header: ${header.join(';')}`);
  }

  const municipalityBuckets = new Map<string, AggregateBucket>();
  const sectionBuckets = new Map<string, AggregateBucket>();

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index]?.trim();
    if (!line) {
      continue;
    }

    const columns = splitCsvLine(line);
    if (columns.length < 6) {
      continue;
    }

    const municipalityCode = parseMunicipalityCode(columns[0] ?? '');
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

    const measure = parseIncomeMeasure(columns[3] ?? '');
    if (!measure) {
      continue;
    }

    const periodYear = parsePeriodYear(columns[4] ?? '');
    if (periodYear == null) {
      continue;
    }

    const amount = parseAdrhEuroAmount(columns[5] ?? '');
    if (amount == null) {
      continue;
    }

    const key = `${municipalityCode}:${periodYear}`;
    const isMunicipalityRow = isMunicipalityAggregateRow(
      columns[1] ?? '',
      columns[2] ?? '',
    );
    const target = isMunicipalityRow ? municipalityBuckets : sectionBuckets;
    const bucket = target.get(key) ?? emptyBucket(municipalityCode, periodYear);
    addMeasure(bucket, measure, amount);
    target.set(key, bucket);
  }

  const keys = new Set([
    ...municipalityBuckets.keys(),
    ...sectionBuckets.keys(),
  ]);
  const rows: MunicipalIncomeStats[] = [];

  for (const key of keys) {
    const preferred
      = municipalityBuckets.get(key) ?? sectionBuckets.get(key);
    if (!preferred) {
      continue;
    }

    rows.push({
      municipalityCode: preferred.municipalityCode,
      periodYear: preferred.periodYear,
      meanNetIncomePerPerson: meanOrNull(
        preferred.personSum,
        preferred.personCount,
      ),
      meanNetIncomePerHousehold: meanOrNull(
        preferred.householdSum,
        preferred.householdCount,
      ),
      sourceSystem: 'ine-adrh',
      fetchedAt: options.fetchedAt,
    });
  }

  rows.sort((left, right) => {
    if (left.periodYear !== right.periodYear) {
      return right.periodYear - left.periodYear;
    }
    return left.municipalityCode.localeCompare(right.municipalityCode);
  });

  return rows;
}
