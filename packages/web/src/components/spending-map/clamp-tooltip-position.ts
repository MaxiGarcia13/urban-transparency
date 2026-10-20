export function clampTooltipPosition(options: {
  x: number;
  y: number;
  tooltipWidth: number;
  tooltipHeight: number;
  containerWidth: number;
  containerHeight: number;
  offset?: number;
  margin?: number;
}): { left: number; top: number } {
  const offset = options.offset ?? 12;
  const margin = options.margin ?? 8;
  const maxLeft = Math.max(
    margin,
    options.containerWidth - options.tooltipWidth - margin,
  );
  const maxTop = Math.max(
    margin,
    options.containerHeight - options.tooltipHeight - margin,
  );

  return {
    left: Math.min(Math.max(options.x + offset, margin), maxLeft),
    top: Math.min(Math.max(options.y + offset, margin), maxTop),
  };
}
