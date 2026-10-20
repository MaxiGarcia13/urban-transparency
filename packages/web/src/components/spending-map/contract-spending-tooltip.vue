<script setup lang="ts">
import type { ContractSpendingTooltipState } from './contract-spending-tooltip-state';
import { formatEur } from '@/utils/format-eur';

defineProps<ContractSpendingTooltipState>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div
    class="absolute z-10 max-w-xs rounded-xl border border-white/10 bg-zinc-950/95 px-4 py-4 text-white shadow-lg backdrop-blur-sm"
    :style="{ left: `${x + 12}px`, top: `${y + 12}px` }"
    @click.stop
    @wheel.stop
  >
    <div class="mb-2 flex items-start justify-between gap-4">
      <p
        v-if="!hasKnownLocation"
        class="text-xs tracking-wide text-zinc-400 uppercase"
      >
        Sin ubicación conocida
      </p>
      <span v-else class="flex-1" />
      <button
        type="button"
        class="shrink-0 rounded-xl px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-white"
        aria-label="Cerrar"
        @click="emit('close')"
      >
        Cerrar
      </button>
    </div>

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
      <ul class="mt-4 flex max-h-48 flex-col gap-2 overflow-y-auto overscroll-contain">
        <li
          v-for="contract in contracts"
          :key="contract.id"
          class="border-t border-white/10 pt-2"
        >
          <p class="text-xs leading-snug text-balance text-zinc-300">
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
