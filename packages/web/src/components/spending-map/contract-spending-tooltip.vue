<script setup lang="ts">
import type { ContractSpendingTooltipState } from './contract-spending-tooltip-state';
import { useResizeObserver } from '@vueuse/core';
import { nextTick, onMounted, ref, watch } from 'vue';
import PublicContractCardBody from '@/components/public-contract/public-contract-card-body.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatEur } from '@/utils/format-eur';
import { clampTooltipPosition } from './clamp-tooltip-position';

const props = defineProps<ContractSpendingTooltipState>();

const emit = defineEmits<{
  close: [];
}>();

const root = ref<HTMLElement | null>(null);
const left = ref(props.x + 12);
const top = ref(props.y + 12);

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

useResizeObserver(root, () => {
  updatePosition();
});

onMounted(async () => {
  await nextTick();
  updatePosition();
});
</script>

<template>
  <div
    ref="root"
    class="absolute z-4 flex max-h-[min(20rem,calc(100%-16px))] max-w-[min(20rem,calc(100%-16px))] flex-col"
    :style="{ left: `${left}px`, top: `${top}px` }"
    @click.stop
    @wheel.stop
  >
    <Card
      class="flex max-h-full min-h-0 flex-col overflow-hidden bg-background/95 py-0 text-foreground shadow-lg backdrop-blur-sm"
    >
      <CardContent class="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain px-4 py-4">
        <div class="mb-2 flex shrink-0 items-start justify-between gap-4">
          <p
            v-if="!hasKnownLocation"
            class="text-xs tracking-wide text-muted-foreground uppercase"
          >
            Sin ubicación conocida
          </p>
          <span v-else class="flex-1" />
          <Button
            type="button"
            variant="ghost"
            size="xs"
            class="h-auto shrink-0 rounded-xl px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Cerrar"
            @click="emit('close')"
          >
            Cerrar
          </Button>
        </div>

        <div
          v-if="contractCount === 1 && contracts[0]"
          class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <PublicContractCardBody :contract="contracts[0]" />
        </div>

        <template v-else>
          <p class="shrink-0 text-sm font-semibold">
            {{ contractCount }} contratos
          </p>
          <p class="mt-2 shrink-0 text-2xl font-semibold text-orange-300">
            {{ formatEur(totalAwardedEur) }}
          </p>
          <ul class="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain">
            <li
              v-for="(contract, index) in contracts"
              :key="contract.id"
            >
              <Separator
                v-if="index > 0"
                class="mb-2"
              />
              <PublicContractCardBody :contract="contract" />
            </li>
          </ul>
        </template>
      </CardContent>
    </Card>
  </div>
</template>
