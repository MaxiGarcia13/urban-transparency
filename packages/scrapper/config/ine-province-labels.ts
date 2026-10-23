// INE ADRH province column labels (table 53689) → 2-digit INE codes.
export const INE_PROVINCE_CODE_BY_LABEL: Readonly<Record<string, string>> = {
  'Araba/Álava': '01',
  'Asturias': '33',
  'Bizkaia': '48',
  'Cantabria': '39',
  'Gipuzkoa': '20',
};

export function resolveProvinceCodeFromIneLabel(
  label: string,
): string | null {
  const trimmed = label.trim();
  return INE_PROVINCE_CODE_BY_LABEL[trimmed] ?? null;
}
