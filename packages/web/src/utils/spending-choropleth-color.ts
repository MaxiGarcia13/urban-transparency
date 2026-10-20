export type RgbaColor = [number, number, number, number];

const EMPTY_FILL: RgbaColor = [55, 48, 40, 160];
const LOW_FILL: RgbaColor = [180, 90, 40, 200];
const HIGH_FILL: RgbaColor = [255, 140, 50, 230];
const HOVER_FILL: RgbaColor = [255, 200, 100, 255];

/** Sequential warm fill from spending amount (empty → low → high). */
export function spendingChoroplethColor(
  totalAwardedEur: number,
  maxAwardedEur: number,
  isHovered: boolean,
): RgbaColor {
  if (isHovered) {
    return HOVER_FILL;
  }

  if (totalAwardedEur <= 0 || maxAwardedEur <= 0) {
    return EMPTY_FILL;
  }

  const ratio = Math.min(1, totalAwardedEur / maxAwardedEur);

  return [
    Math.round(LOW_FILL[0] + (HIGH_FILL[0] - LOW_FILL[0]) * ratio),
    Math.round(LOW_FILL[1] + (HIGH_FILL[1] - LOW_FILL[1]) * ratio),
    Math.round(LOW_FILL[2] + (HIGH_FILL[2] - LOW_FILL[2]) * ratio),
    Math.round(LOW_FILL[3] + (HIGH_FILL[3] - LOW_FILL[3]) * ratio),
  ];
}
