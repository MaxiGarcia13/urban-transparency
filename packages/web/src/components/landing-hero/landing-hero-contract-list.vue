<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import type { ComponentPublicInstance } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import PublicContractCardSkeleton from '@/components/public-contract/public-contract-card-skeleton.vue';
import PublicContractCard from '@/components/public-contract/public-contract-card.vue';
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

let resizeObserver: ResizeObserver | null = null;

function observeScrollLayout(): void {
  resizeObserver?.disconnect();
  resizeObserver = null;
  syncScrollMargin();

  const scrollParent = props.scrollElement ?? listRoot.value?.parentElement;
  if (!scrollParent || typeof ResizeObserver === 'undefined') {
    return;
  }

  resizeObserver = new ResizeObserver(() => {
    syncScrollMargin();
  });
  for (const child of scrollParent.children) {
    resizeObserver.observe(child);
  }
}

onMounted(() => {
  observeScrollLayout();
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});

watch(
  () => props.scrollElement,
  () => {
    observeScrollLayout();
  },
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
      class="text-sm text-zinc-400"
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
          class="text-sm text-zinc-400"
        >
          Ningún contrato coincide con los filtros
        </p>
      </div>
    </div>

    <p
      class="mt-6 w-fit rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-xs tracking-wide text-zinc-400 uppercase md:mt-8"
    >
      Datos PLACSP · {{ cantabriaRegion.name }}
    </p>
  </div>
</template>
