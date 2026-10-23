// Verified seed cache: province → jaxiT3 table id for
// "Indicadores de renta media y mediana" (DIST-SECC-MUN).
// Client still resolves unknown provinces via TempUS + CSV peek.
export const ADRH_RENTA_MEDIA_TABLE_ID_BY_PROVINCE: Readonly<
  Record<string, number>
> = {
  '01': 30851,
  '20': 31007,
  '33': 30860,
  '39': 30953,
  '48': 30917,
};
