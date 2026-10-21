import type { PublicContractStatus } from '@urban-transparency/shared';

export type RgbaColor = [number, number, number, number];

const PUBLIC_CONTRACT_STATUS_LABELS: Record<PublicContractStatus, string> = {
  PRE: 'Anuncio previo',
  PUB: 'En plazo',
  EV: 'Pendiente de adjudicación',
  ADJ: 'Adjudicada',
  RES: 'Resuelta',
  ANUL: 'Anulada',
  UNKNOWN: 'Estado desconocido',
};

const PUBLIC_CONTRACT_STATUS_RGBA: Record<PublicContractStatus, RgbaColor> = {
  PRE: [148, 163, 184, 220],
  PUB: [56, 189, 248, 220],
  EV: [251, 191, 36, 220],
  ADJ: [251, 146, 60, 220],
  RES: [52, 211, 153, 220],
  ANUL: [251, 113, 133, 220],
  UNKNOWN: [113, 113, 122, 200],
};

const PUBLIC_CONTRACT_STATUS_TEXT_CLASS: Record<PublicContractStatus, string> = {
  PRE: 'text-slate-300',
  PUB: 'text-sky-300',
  EV: 'text-amber-300',
  ADJ: 'text-orange-300',
  RES: 'text-emerald-300',
  ANUL: 'text-rose-300',
  UNKNOWN: 'text-zinc-400',
};

export const MIXED_STATUS_RGBA: RgbaColor = [212, 212, 216, 220];
export const UNKNOWN_LOCATION_RGBA: RgbaColor = [113, 113, 122, 200];

export function formatPublicContractStatus(
  status: PublicContractStatus,
): string {
  return PUBLIC_CONTRACT_STATUS_LABELS[status];
}

export function publicContractStatusRgba(
  status: PublicContractStatus,
): RgbaColor {
  return PUBLIC_CONTRACT_STATUS_RGBA[status];
}

export function publicContractStatusTextClass(
  status: PublicContractStatus,
): string {
  return PUBLIC_CONTRACT_STATUS_TEXT_CLASS[status];
}
