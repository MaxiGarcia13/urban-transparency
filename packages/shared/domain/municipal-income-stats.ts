export interface MunicipalIncomeStats {
  municipalityCode: string;
  periodYear: number;
  rentaNetaMediaPersona: number | null;
  rentaNetaMediaHogar: number | null;
  sourceSystem: 'ine-adrh';
  fetchedAt: string;
}
