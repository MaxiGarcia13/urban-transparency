export interface MunicipalIncomeStats {
  municipalityCode: string;
  periodYear: number;
  meanNetIncomePerPerson: number | null;
  meanNetIncomePerHousehold: number | null;
  sourceSystem: 'ine-adrh';
  fetchedAt: string;
}
