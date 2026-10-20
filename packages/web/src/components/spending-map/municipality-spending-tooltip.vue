<script setup lang="ts">
import type { MunicipalitySpendingTooltipState } from './municipality-spending-tooltip-state';
import { formatEur } from '@/utils/format-eur';

defineProps<MunicipalitySpendingTooltipState>();
</script>

<template>
  <div
    class="pointer-events-none absolute z-10 max-w-xs rounded-xl border border-white/10 bg-zinc-950/90 px-4 py-4 text-white shadow-lg backdrop-blur-sm"
    :style="{ left: `${x + 12}px`, top: `${y + 12}px` }"
  >
    <p class="text-base font-semibold">
      {{ name }}
    </p>
    <p class="mt-2 text-sm text-zinc-300">
      {{ contractCount }}
      {{ contractCount === 1 ? 'contrato' : 'contratos' }}
    </p>
    <p class="mt-2 text-2xl font-semibold text-orange-300">
      {{ formatEur(totalAwardedEur) }}
    </p>
    <p class="mt-2 text-xs tracking-wide text-zinc-500 uppercase">
      Gasto municipal · PLACSP
    </p>
  </div>
</template>
