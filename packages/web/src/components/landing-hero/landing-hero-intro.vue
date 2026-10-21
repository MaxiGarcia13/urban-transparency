<script setup lang="ts">
import type { MunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { PRODUCT_NAME } from '@/config/product';
import { cantabriaRegion } from '@/config/regions/cantabria';
import { formatEur } from '@/utils/format-eur';

defineProps<{
  spending: MunicipalSpending | null;
  isExpanded: boolean;
}>();

const emit = defineEmits<{
  toggleExpanded: [];
}>();
</script>

<template>
  <div class="flex shrink-0 flex-col gap-4 p-4 md:gap-6 md:p-8">
    <div class="flex items-center gap-2">
      <img
        src="/android-chrome-192x192.png"
        alt=""
        width="32"
        height="32"
        class="size-8 shrink-0"
        decoding="async"
      >
      <p class="text-sm font-medium tracking-wide text-orange-300 uppercase">
        {{ PRODUCT_NAME }}
      </p>
    </div>

    <div class="flex flex-col gap-2 md:gap-4">
      <h1 class="max-w-md text-3xl leading-tight font-semibold text-balance md:text-5xl">
        ¿Dónde va el
        <span class="text-orange-400">gasto público</span>
        en {{ cantabriaRegion.name }}?
      </h1>
      <p class="max-w-md text-sm leading-relaxed text-zinc-400 md:text-base">
        Adjudicaciones municipales de
        {{ cantabriaRegion.name }}
        publicadas en PLACSP.
      </p>
    </div>

    <div
      v-if="spending && spending.contractCount > 0"
      class="flex flex-col gap-2"
    >
      <p class="text-sm text-zinc-400">
        {{ spending.contractCount }}
        {{ spending.contractCount === 1 ? 'contrato' : 'contratos' }}
      </p>
      <p class="text-2xl font-semibold text-orange-300 md:text-3xl">
        {{ formatEur(spending.totalAwardedEur) }}
      </p>
    </div>

    <button
      type="button"
      class="flex w-full items-center justify-between rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-200 lg:hidden"
      :aria-expanded="isExpanded"
      aria-controls="landing-hero-details"
      @click="emit('toggleExpanded')"
    >
      <span>{{ isExpanded ? 'Ocultar búsqueda y filtros' : 'Buscar y filtrar' }}</span>
      <span
        class="text-zinc-400 transition-transform duration-200"
        :class="isExpanded ? 'rotate-180' : ''"
        aria-hidden="true"
      >
        ▾
      </span>
    </button>
  </div>
</template>
