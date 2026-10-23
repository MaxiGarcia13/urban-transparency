export function isMunicipalityIncomeCode(code: string): boolean {
  return /^\d{5}$/.test(code);
}

export function isProvinceIncomeAggregateCode(code: string): boolean {
  return /^\d{2}$/.test(code);
}
