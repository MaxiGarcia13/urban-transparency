<script setup lang="ts">
import type { ContractSpendingTooltipState } from './contract-spending-tooltip-state';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { formatEur } from '@/utils/format-eur';
import { formatPartyDisplayName } from '@/utils/format-party-display-name';
import {
  formatPublicContractStatus,
  publicContractStatusTextClass,
} from '@/utils/public-contract-status-style';
import { clampTooltipPosition } from './clamp-tooltip-position';

const props = defineProps<ContractSpendingTooltipState>();

const emit = defineEmits<{
  close: [];
}>();

const root = ref<HTMLElement | null>(null);
const left = ref(props.x + 12);
const top = ref(props.y + 12);

let resizeObserver: ResizeObserver | null = null;

function updatePosition(): void {
  const el = root.value;
  const container = el?.offsetParent;
  if (!(el instanceof HTMLElement) || !(container instanceof HTMLElement)) {
    return;
  }

  const position = clampTooltipPosition({
    x: props.x,
    y: props.y,
    tooltipWidth: el.offsetWidth,
    tooltipHeight: el.offsetHeight,
    containerWidth: container.clientWidth,
    containerHeight: container.clientHeight,
  });

  left.value = position.left;
  top.value = position.top;
}

watch(
  () => [props.x, props.y, props.contractCount, props.contracts] as const,
  async () => {
    await nextTick();
    updatePosition();
  },
);

onMounted(async () => {
  await nextTick();
  updatePosition();

  if (root.value) {
    resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });
    resizeObserver.observe(root.value);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>

<template>
  <div
    ref="root"
    class="absolute z-10 max-h-[min(20rem,calc(100%-16px))] max-w-[min(20rem,calc(100%-16px))] overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-zinc-950/95 px-4 py-4 text-white shadow-lg backdrop-blur-sm"
    :style="{ left: `${left}px`, top: `${top}px` }"
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
        v-if="contracts[0]"
        class="mt-2 text-xs tracking-wide"
        :class="publicContractStatusTextClass(contracts[0].status)"
      >
        {{ formatPublicContractStatus(contracts[0].status) }}
      </p>
      <template v-if="contracts[0]">
        <p class="mt-2 text-sm text-zinc-400">
          Órgano:
          {{
            formatPartyDisplayName(
              contracts[0].contractingPartyName,
              contracts[0].contractingPartyNif,
            )
          }}
        </p>
        <p class="mt-2 text-sm text-zinc-400">
          Adjudicatario:
          {{
            formatPartyDisplayName(
              contracts[0].awardeeName,
              contracts[0].awardeeNif,
            ) ?? 'no disponible'
          }}
        </p>
      </template>
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
          <p
            class="mt-2 text-xs tracking-wide"
            :class="publicContractStatusTextClass(contract.status)"
          >
            {{ formatPublicContractStatus(contract.status) }}
          </p>
          <p class="mt-2 text-xs text-zinc-400">
            Órgano:
            {{
              formatPartyDisplayName(
                contract.contractingPartyName,
                contract.contractingPartyNif,
              )
            }}
          </p>
          <p class="mt-2 text-xs text-zinc-400">
            Adjudicatario:
            {{
              formatPartyDisplayName(
                contract.awardeeName,
                contract.awardeeNif,
              ) ?? 'no disponible'
            }}
          </p>
          <p class="mt-2 text-sm font-semibold text-orange-300/90">
            {{ formatEur(contract.awardedAmountEur) }}
          </p>
        </li>
      </ul>
    </template>
  </div>
</template>
