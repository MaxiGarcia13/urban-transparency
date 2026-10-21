<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import type { ComponentPublicInstance } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { useResizeObserver } from '@vueuse/core';
import { computed, ref, useTemplateRef, watch } from 'vue';
import PublicContractCardSkeleton from '@/components/public-contract/public-contract-card-skeleton.vue';
import PublicContractCard from '@/components/public-contract/public-contract-card.vue';
import { Badge } from '@/components/ui/badge';
import { cantabriaRegion } from '@/config/regions/cantabria';

const props = defineProps<{
  contracts: PublicContract[];
  isLoading?: boolean;
  statusMessage: string | null;
  scrollElement: HTMLElement | null;
}>();

const emit = defineEmits<{
  select: [contract: PublicContract];
}>();

const SKELETON_ROW_COUNT = 4;

const listRoot = useTemplateRef<HTMLElement>('listRoot');
const scrollMargin = ref(0);

function syncScrollMargin(): void {
  scrollMargin.value = listRoot.value?.offsetTop ?? 0;
}

const scrollLayoutTargets = computed(() => {
  const scrollParent = props.scrollElement ?? listRoot.value?.parentElement;
  if (!scrollParent) {
    return [];
  }
  return [...scrollParent.children] as HTMLElement[];
});

const rowCount = computed(() => {
  if (props.isLoading || props.statusMessage) {
    return 0;
  }
  return Math.max(props.contracts.length, 1);
});

const virtualizer = useVirtualizer(
  computed(() => ({
    count: rowCount.value,
    getScrollElement: () => props.scrollElement,
    estimateSize: () => 220,
    overscan: 6,
    gap: 16,
    scrollMargin: scrollMargin.value,
  })),
);

const virtualRows = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

function measureRow(element: Element | ComponentPublicInstance | null): void {
  if (element instanceof Element) {
    virtualizer.value.measureElement(element);
  }
}

useResizeObserver(scrollLayoutTargets, () => {
  syncScrollMargin();
});

watch(
  scrollLayoutTargets,
  () => {
    syncScrollMargin();
  },
  { flush: 'post', immediate: true },
);
</script>

<template>
  <div ref="listRoot">
    <div
      v-if="isLoading"
      class="flex flex-col gap-4"
      aria-busy="true"
      aria-label="Cargando contratos"
    >
      <PublicContractCardSkeleton
        v-for="index in SKELETON_ROW_COUNT"
        :key="index"
      />
    </div>

    <p
      v-else-if="statusMessage"
      class="text-sm text-muted-foreground"
    >
      {{ statusMessage }}
    </p>

    <div
      v-else
      class="relative w-full"
      :style="{ height: `${totalSize}px` }"
    >
      <div
        v-for="row in virtualRows"
        :key="row.index"
        :ref="measureRow"
        class="absolute top-0 left-0 w-full"
        :data-index="row.index"
        :style="{
          transform: `translateY(${row.start - scrollMargin}px)`,
        }"
      >
        <PublicContractCard
          v-if="contracts[row.index]"
          :contract="contracts[row.index]!"
          @select="emit('select', $event)"
        />
        <p
          v-else
          class="text-sm text-muted-foreground"
        >
          Ningún contrato coincide con los filtros
        </p>
      </div>
    </div>

    <Badge
      variant="outline"
      class="mt-6 w-fit rounded-xl border-border bg-card/80 px-4 py-2 text-xs tracking-wide text-muted-foreground uppercase md:mt-8"
    >
      Datos PLACSP · {{ cantabriaRegion.name }}
    </Badge>
  </div>
</template>
