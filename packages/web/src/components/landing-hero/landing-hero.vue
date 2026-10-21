<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import type { MunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { onKeyStroke } from '@vueuse/core';
import { computed, ref, useTemplateRef } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getMapRegionById } from '@/config/regions';
import LandingHeroContractList from './landing-hero-contract-list.vue';
import LandingHeroIntro from './landing-hero-intro.vue';

const props = withDefaults(
  defineProps<{
    contracts?: PublicContract[];
    allContractCount?: number;
    spending?: MunicipalSpending | null;
    isLoading?: boolean;
    isError?: boolean;
  }>(),
  {
    contracts: () => [],
    allContractCount: 0,
    spending: null,
    isLoading: false,
    isError: false,
  },
);

const emit = defineEmits<{
  selectContract: [contract: PublicContract];
}>();

const searchQuery = defineModel<string>('searchQuery', { default: '' });
const regionId = defineModel<string>('regionId', { required: true });
const isExpanded = ref(false);
const detailsScroll = useTemplateRef<HTMLElement>('detailsScroll');
const regionName = computed(() => getMapRegionById(regionId.value).name);

const statusMessage = computed(() => {
  if (props.isLoading) {
    return null;
  }
  if (props.isError) {
    return 'No se pudieron cargar los contratos';
  }
  if (props.allContractCount === 0) {
    return 'Aún no hay contratos scrapeados para este municipio';
  }
  return null;
});

function toggleExpanded(): void {
  isExpanded.value = !isExpanded.value;
}

function selectContract(contract: PublicContract): void {
  emit('selectContract', contract);
  isExpanded.value = false;
}

onKeyStroke('Escape', () => {
  if (isExpanded.value) {
    isExpanded.value = false;
  }
});
</script>

<template>
  <aside class="flex h-full min-h-0 flex-col text-zinc-100">
    <LandingHeroIntro
      v-model:region-id="regionId"
      :spending="spending"
      :is-loading="isLoading"
      :is-expanded="isExpanded"
      @toggle-expanded="toggleExpanded"
    />

    <div
      id="landing-hero-details"
      class="grid min-h-0 transition-[grid-template-rows] duration-300 ease-out lg:min-h-0 lg:flex-1"
      :class="isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] lg:grid-rows-[1fr]'"
    >
      <div class="min-h-0 overflow-hidden">
        <div
          ref="detailsScroll"
          class="flex max-h-[min(48dvh,100%)] min-h-0 flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-4 md:gap-8 md:px-8 md:pb-8 lg:h-full lg:max-h-none"
        >
          <div class="flex flex-col gap-2">
            <Label
              for="contract-quick-search"
              class="text-sm text-muted-foreground"
            >
              Busca por título, empresa, NIF u organismo
            </Label>
            <Input
              id="contract-quick-search"
              v-model="searchQuery"
              type="search"
              name="contract-quick-search"
              placeholder="Título, empresa, NIF u organismo…"
              class="h-auto rounded-xl border-border bg-card px-4 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-ring md:py-4"
            />
          </div>

          <LandingHeroContractList
            :contracts="contracts"
            :region-name="regionName"
            :is-loading="isLoading"
            :status-message="statusMessage"
            :scroll-element="detailsScroll"
            @select="selectContract"
          />
        </div>
      </div>
    </div>
  </aside>
</template>
