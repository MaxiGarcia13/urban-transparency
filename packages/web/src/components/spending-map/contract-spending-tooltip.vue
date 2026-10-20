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
    <template v-if="contractCount === 1">
      <p class="text-sm font-semibold text-balance">
        {{ contracts[0]?.title }}
      </p>
      <p
        v-if="postalCode"
        class="mt-2 text-xs tracking-wide text-zinc-400 uppercase"
      >
        CP {{ postalCode }}
      </p>
      <p class="mt-2 text-2xl font-semibold text-orange-300">
        {{ formatEur(totalAwardedEur) }}
      </p>
    </template>

    <template v-else>
      <p class="text-sm font-semibold">
        {{ contractCount }} contratos
      </p>
      <p
        v-if="postalCode"
        class="mt-2 text-xs tracking-wide text-zinc-400 uppercase"
      >
        CP {{ postalCode }}
      </p>
      <p class="mt-2 text-2xl font-semibold text-orange-300">
        {{ formatEur(totalAwardedEur) }}
      </p>
      <ul class="mt-4 flex max-h-48 flex-col gap-2 overflow-y-auto">
        <li
          v-for="contract in contracts"
          :key="contract.id"
          class="border-t border-white/10 pt-2"
        >
          <p class="text-xs leading-snug text-zinc-300 text-balance">
            {{ contract.title }}
          </p>
          <p class="mt-1 text-sm font-semibold text-orange-300/90">
            {{ formatEur(contract.awardedAmountEur) }}
          </p>
        </li>
      </ul>
    </template>
  </div>
</template>
