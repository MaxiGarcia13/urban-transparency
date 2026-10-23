import { formatPercent } from './format-percent';

export function formatSignedPercent(value: number): string {
  const absolute = formatPercent(Math.abs(value));
  if (value > 0) {
    return `+${absolute}`;
  }
  if (value < 0) {
    return `−${absolute}`;
  }
  return absolute;
}
