export function formatPartyDisplayName(
  name: string | null | undefined,
  nif: string | null | undefined,
): string | null {
  if (!name) {
    return null;
  }
  if (!nif) {
    return name;
  }
  return `${name} (${nif})`;
}
