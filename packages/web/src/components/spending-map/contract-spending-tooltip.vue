<script setup lang="ts">
import type { ContractSpendingTooltipState } from './contract-spending-tooltip-state';
import { formatEur } from '@/utils/format-eur';

defineProps<ContractSpendingTooltipState>();
</script>

<template>
  <div
    class="pointer-events-none absolute z-10 max-w-xs rounded-xl border border-white/10 bg-zinc-950/90 px-4 py-4 text-white shadow-lg backdrop-blur-sm"
    :style="{ left: `${x + 12}px`, top: `${y + 12}px` }"
  >
    <p class="text-sm font-semibold text-balance">
      {{ title }}
    </p>
    <p v-if="postalCode" class="mt-2 text-xs tracking-wide text-zinc-400 uppercase">
      CP {{ postalCode }}
    </p>
    <p class="mt-2 text-2xl font-semibold text-orange-300">
      {{ formatEur(awardedAmountEur) }}
    </p>
  </div>
</template>
