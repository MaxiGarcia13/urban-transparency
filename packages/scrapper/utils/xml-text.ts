/** Normalize fast-xml-parser leaf values to a trimmed string. */
export function xmlText(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const text = String(value).trim();
    return text.length > 0 ? text : null;
  }
  if (typeof value === 'object' && '#text' in value) {
    return xmlText((value as { '#text': unknown })['#text']);
  }
  return null;
}

export function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}
