export type RgbaColor = [number, number, number, number];

/** Green → yellow → orange/red, similar to Municipios Argentinos index scale. */
const LOW_FILL: RgbaColor = [46, 160, 90, 210];
const MID_FILL: RgbaColor = [230, 190, 60, 220];
const HIGH_FILL: RgbaColor = [220, 70, 50, 230];
const EMPTY_FILL: RgbaColor = [70, 70, 70, 160];
const HOVER_FILL: RgbaColor = [255, 255, 255, 240];
const DIM_ALPHA = 55;

function mix(a: RgbaColor, b: RgbaColor, t: number): RgbaColor {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    Math.round(a[3] + (b[3] - a[3]) * t),
  ];
}

/** Zone fill color from relative spending (low green → high red). */
export function spendingZoneColor(
  totalAwardedEur: number,
  maxAwardedEur: number,
  options: { isHovered?: boolean; isDimmed?: boolean } = {},
): RgbaColor {
  const { isHovered = false, isDimmed = false } = options;

  if (isHovered) {
    return HOVER_FILL;
  }

  let color: RgbaColor;

  if (totalAwardedEur <= 0 || maxAwardedEur <= 0) {
    color = EMPTY_FILL;
  } else {
    const ratio = Math.min(1, totalAwardedEur / maxAwardedEur);

    color
      = ratio < 0.5
        ? mix(LOW_FILL, MID_FILL, ratio * 2)
        : mix(MID_FILL, HIGH_FILL, (ratio - 0.5) * 2);
  }

  if (isDimmed) {
    return [color[0], color[1], color[2], DIM_ALPHA];
  }

  return color;
}
