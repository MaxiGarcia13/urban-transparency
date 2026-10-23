export function shareToBarWidthPercent(share: number | null | undefined): number {
  if (share == null || share <= 0) {
    return 0;
  }
  return Math.max(2, Math.round(share * 100));
}
