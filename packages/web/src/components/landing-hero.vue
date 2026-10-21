<script setup lang="ts">
import type { PublicContract, PublicContractStatus } from '@urban-transparency/shared';
import type { MunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import PublicContractCard from '@/components/public-contract/public-contract-card.vue';
import { santanderMunicipality } from '@/config/municipalities/santander';
import { PRODUCT_NAME } from '@/config/product';
import { FILTERABLE_PUBLIC_CONTRACT_STATUSES } from '@/domain/filter-public-contracts';
import { formatEur } from '@/utils/format-eur';
import { formatPublicContractStatus } from '@/utils/public-contract-status-style';

const props = withDefaults(
  defineProps<{
    contracts?: PublicContract[];
    availableYears?: number[];
    allContractCount?: number;
    spending?: MunicipalSpending | null;
    isLoading?: boolean;
    isError?: boolean;
  }>(),
  {
    contracts: () => [],
    availableYears: () => [],
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
const selectedStatuses = defineModel<PublicContractStatus[]>('selectedStatuses', {
  default: () => [],
});
const yearFrom = defineModel<number | null>('yearFrom', { default: null });
const yearTo = defineModel<number | null>('yearTo', { default: null });
const isExpanded = ref(false);

const statusMessage = computed(() => {
  if (props.isLoading) {
    return 'Cargando contratos…';
  }
  if (props.isError) {
    return 'No se pudieron cargar los contratos';
  }
  if (props.allContractCount === 0) {
    return 'Aún no hay contratos scrapeados para este municipio';
  }
  return null;
});

function isStatusSelected(status: PublicContractStatus): boolean {
  return selectedStatuses.value.includes(status);
}

function toggleStatus(status: PublicContractStatus): void {
  if (isStatusSelected(status)) {
    selectedStatuses.value = selectedStatuses.value.filter(
      (selected) => selected !== status,
    );
    return;
  }
  selectedStatuses.value = [...selectedStatuses.value, status];
}

function parseYearSelect(value: string): number | null {
  if (!value) {
    return null;
  }
  const year = Number(value);
  return Number.isFinite(year) ? year : null;
}

function onYearFromChange(event: Event): void {
  const year = parseYearSelect((event.target as HTMLSelectElement).value);
  yearFrom.value = year;
  if (year != null && yearTo.value != null && year > yearTo.value) {
    yearTo.value = year;
  }
}

function onYearToChange(event: Event): void {
  const year = parseYearSelect((event.target as HTMLSelectElement).value);
  yearTo.value = year;
  if (year != null && yearFrom.value != null && year < yearFrom.value) {
    yearFrom.value = year;
  }
}

function toggleExpanded(): void {
  isExpanded.value = !isExpanded.value;
}

function selectContract(contract: PublicContract): void {
  emit('selectContract', contract);
  isExpanded.value = false;
}

function handleEscapeKey(event: KeyboardEvent): void {
  if (event.key === 'Escape' && isExpanded.value) {
    isExpanded.value = false;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscapeKey);
});
</script>

<template>
  <aside class="flex h-full min-h-0 flex-col text-zinc-100">
    <div class="flex shrink-0 flex-col gap-4 p-4 md:gap-6 md:p-8">
      <p class="text-sm font-medium tracking-wide text-orange-300 uppercase">
        {{ PRODUCT_NAME }}
      </p>

      <div class="flex flex-col gap-2 md:gap-4">
        <h1 class="max-w-md text-3xl leading-tight font-semibold text-balance md:text-5xl">
          ¿Dónde va el
          <span class="text-orange-400">gasto público</span>
          de tu ciudad?
        </h1>
        <p class="max-w-md text-sm leading-relaxed text-zinc-400 md:text-base">
          Adjudicaciones de
          {{ santanderMunicipality.name }}
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
        @click="toggleExpanded"
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

    <div
      id="landing-hero-details"
      class="grid min-h-0 transition-[grid-template-rows] duration-300 ease-out lg:min-h-0 lg:flex-1"
      :class="isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] lg:grid-rows-[1fr]'"
    >
      <div class="min-h-0 overflow-hidden">
        <div class="flex max-h-[min(48dvh,100%)] flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-4 md:gap-8 md:px-8 md:pb-8 lg:h-full lg:max-h-none">
          <label class="flex flex-col gap-2">
            <span class="text-sm text-zinc-400">Busca un contrato o adjudicatario</span>
            <input
              v-model="searchQuery"
              type="search"
              name="contract-search"
              placeholder="Título, empresa…"
              class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-base text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-orange-400/60 md:py-4"
            >
          </label>

          <fieldset class="flex flex-col gap-2">
            <legend class="text-sm text-zinc-400">
              Estado
            </legend>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="status in FILTERABLE_PUBLIC_CONTRACT_STATUSES"
                :key="status"
                type="button"
                class="rounded-xl px-4 py-2 text-sm"
                :class="
                  isStatusSelected(status)
                    ? 'bg-orange-500/20 text-orange-200 ring-1 ring-orange-400/40'
                    : 'bg-zinc-900 text-zinc-400 ring-1 ring-white/5'
                "
                :aria-pressed="isStatusSelected(status)"
                @click="toggleStatus(status)"
              >
                {{ formatPublicContractStatus(status) }}
              </button>
            </div>
          </fieldset>

          <div class="flex flex-col gap-2">
            <p class="text-sm text-zinc-400">
              Año
            </p>
            <div class="grid grid-cols-2 gap-4">
              <label class="flex flex-col gap-2">
                <span class="text-xs tracking-wide text-zinc-500 uppercase">Desde</span>
                <select
                  class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 outline-none focus:border-orange-400/60"
                  :value="yearFrom ?? ''"
                  :disabled="availableYears.length === 0"
                  @change="onYearFromChange"
                >
                  <option value="">
                    Todos
                  </option>
                  <option
                    v-for="year in availableYears"
                    :key="`from-${year}`"
                    :value="year"
                  >
                    {{ year }}
                  </option>
                </select>
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-xs tracking-wide text-zinc-500 uppercase">Hasta</span>
                <select
                  class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 outline-none focus:border-orange-400/60"
                  :value="yearTo ?? ''"
                  :disabled="availableYears.length === 0"
                  @change="onYearToChange"
                >
                  <option value="">
                    Todos
                  </option>
                  <option
                    v-for="year in availableYears"
                    :key="`to-${year}`"
                    :value="year"
                  >
                    {{ year }}
                  </option>
                </select>
              </label>
            </div>
          </div>

          <p v-if="statusMessage" class="text-sm text-zinc-400">
            {{ statusMessage }}
          </p>

          <ul
            v-else
            class="flex flex-col gap-4"
          >
            <li
              v-for="contract in contracts"
              :key="contract.id"
            >
              <PublicContractCard
                :contract="contract"
                @select="selectContract"
              />
            </li>
            <li
              v-if="contracts.length === 0"
              class="text-sm text-zinc-400"
            >
              Ningún contrato coincide con los filtros
            </li>
          </ul>

          <p
            class="w-fit rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-xs tracking-wide text-zinc-400 uppercase"
          >
            Datos PLACSP · {{ santanderMunicipality.name }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>
