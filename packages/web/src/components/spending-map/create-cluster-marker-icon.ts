import type { RgbaColor } from '@/utils/public-contract-status-style';

const DEVICE_PIXEL_RATIO = 2;
const LABEL_FONT = '600 11px sans-serif';
const LABEL_GAP_PX = 4;

export type ClusterMarkerLabelPlacement = 'center' | 'end';

export interface ClusterMarkerIcon {
  url: string;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
}

interface CreateClusterMarkerIconOptions {
  fill: RgbaColor;
  radiusPx: number;
  label: string;
  labelPlacement: ClusterMarkerLabelPlacement;
}

const iconCache = new Map<string, ClusterMarkerIcon>();

function rgbaCss([r, g, b, a]: RgbaColor): string {
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
}

function cacheKey({
  fill,
  radiusPx,
  label,
  labelPlacement,
}: CreateClusterMarkerIconOptions): string {
  return `${fill.join(',')}|${radiusPx}|${labelPlacement}|${label}`;
}

export function createClusterMarkerIcon(
  options: CreateClusterMarkerIconOptions,
): ClusterMarkerIcon {
  const key = cacheKey(options);
  const cached = iconCache.get(key);
  if (cached) {
    return cached;
  }

  const { fill, radiusPx, label, labelPlacement } = options;
  const diameter = radiusPx * 2;

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) {
    throw new Error('Failed to create canvas context for cluster marker');
  }
  measureCtx.font = LABEL_FONT;
  const textWidth = label.length > 0 ? measureCtx.measureText(label).width : 0;

  const width =
    labelPlacement === 'end' && label.length > 0
      ? Math.ceil(diameter + LABEL_GAP_PX + textWidth + 2)
      : diameter;
  const height = diameter;

  const canvas = document.createElement('canvas');
  canvas.width = width * DEVICE_PIXEL_RATIO;
  canvas.height = height * DEVICE_PIXEL_RATIO;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create canvas context for cluster marker');
  }
  ctx.scale(DEVICE_PIXEL_RATIO, DEVICE_PIXEL_RATIO);

  ctx.beginPath();
  ctx.arc(radiusPx, radiusPx, radiusPx - 0.5, 0, Math.PI * 2);
  ctx.fillStyle = rgbaCss(fill);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.lineWidth = 1;
  ctx.stroke();

  if (label.length > 0) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.86)';
    ctx.font = LABEL_FONT;
    ctx.textBaseline = 'middle';
    if (labelPlacement === 'center') {
      ctx.textAlign = 'center';
      ctx.fillText(label, radiusPx, radiusPx);
    } else {
      ctx.textAlign = 'left';
      ctx.fillText(label, diameter + LABEL_GAP_PX, radiusPx);
    }
  }

  const icon: ClusterMarkerIcon = {
    url: canvas.toDataURL(),
    width,
    height,
    anchorX: radiusPx,
    anchorY: radiusPx,
  };
  iconCache.set(key, icon);
  return icon;
}
