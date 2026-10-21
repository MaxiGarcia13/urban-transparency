<script setup lang="ts">
import type { MunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { PhCaretDown } from '@phosphor-icons/vue';
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { PRODUCT_NAME } from '@/config/product';
import { getMapRegionById } from '@/config/regions';
import { cn } from '@/lib/utils';
import LandingHeroRegionSelect from './landing-hero-region-select.vue';
import LandingHeroSpendingSummary from './landing-hero-spending-summary.vue';

withDefaults(
  defineProps<{
    spending: MunicipalSpending | null;
    isExpanded: boolean;
    isLoading?: boolean;
  }>(),
  {
    isLoading: false,
  },
);

const emit = defineEmits<{
  toggleExpanded: [];
}>();

const regionId = defineModel<string>('regionId', { required: true });
const regionName = computed(() => getMapRegionById(regionId.value).name);
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
        en
        <LandingHeroRegionSelect v-model:region-id="regionId" />
        ?
      </h1>
      <p
        :class="cn(
          'max-w-md text-sm leading-relaxed text-muted-foreground md:text-base',
          isExpanded ? 'block' : 'hidden lg:block',
        )"
      >
        Adjudicaciones municipales de
        {{ regionName }}
        publicadas en PLACSP.
      </p>
    </div>

    <LandingHeroSpendingSummary
      :spending="spending"
      :is-loading="isLoading"
    />

    <Button
      type="button"
      variant="outline"
      class="flex h-auto w-full items-center justify-between rounded-xl border-border bg-card/80 px-4 py-2 text-sm text-foreground lg:hidden"
      :aria-expanded="isExpanded"
      aria-controls="landing-hero-details"
      @click="emit('toggleExpanded')"
    >
      <span>{{ isExpanded ? 'Ocultar búsqueda' : 'Buscar contratos' }}</span>
      <PhCaretDown
        :class="cn(
          'size-4 text-muted-foreground transition-transform duration-200',
          isExpanded ? 'rotate-180' : '',
        )"
      />
    </Button>
  </div>
</template>
