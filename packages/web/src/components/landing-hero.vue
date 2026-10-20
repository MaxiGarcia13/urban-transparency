<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import type { MunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { computed } from 'vue';
import { santanderMunicipality } from '@/config/municipalities/santander';
import { matchContractsBySearch } from '@/domain/match-contracts-by-search';
import { formatEur } from '@/utils/format-eur';

const searchQuery = defineModel<string>('searchQuery', { default: '' });

const props = withDefaults(
  defineProps<{
    contracts?: PublicContract[];
    spending?: MunicipalSpending | null;
    isLoading?: boolean;
    isError?: boolean;
  }>(),
  {
    contracts: () => [],
    spending: null,
    isLoading: false,
    isError: false,
  },
);

const metrics = [
  { id: 'spending', label: 'Gasto público', enabled: true },
  { id: 'business', label: 'Empresas', enabled: false },
  { id: 'income', label: 'Renta', enabled: false },
  { id: 'rent', label: 'Alquiler', enabled: false },
] as const;

const filteredContracts = computed(() =>
  matchContractsBySearch(searchQuery.value, props.contracts),
);

const statusMessage = computed(() => {
  if (props.isLoading) {
    return 'Cargando contratos…';
  }
  if (props.isError) {
    return 'No se pudieron cargar los contratos';
  }
  if (props.contracts.length === 0) {
    return 'Aún no hay contratos scrapeados para este municipio';
  }
  return null;
});
</script>

<template>
  <aside class="flex h-full flex-col gap-8 overflow-y-auto p-6 text-zinc-100 md:p-8">
    <div class="flex flex-col gap-8">
      <p class="text-sm font-medium tracking-wide text-orange-300 uppercase">
        UrbanClarity 3D
      </p>

      <div class="flex flex-col gap-4">
        <h1 class="max-w-md text-4xl leading-tight font-semibold text-balance md:text-5xl">
          ¿Dónde va el
          <span class="text-orange-400">gasto público</span>
          de tu ciudad?
        </h1>
        <p class="max-w-md text-base leading-relaxed text-zinc-400">
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
        <p class="text-3xl font-semibold text-orange-300">
          {{ formatEur(spending.totalAwardedEur) }}
        </p>
      </div>

      <label class="flex flex-col gap-2">
        <span class="text-sm text-zinc-400">Busca un contrato o adjudicatario</span>
        <input
          v-model="searchQuery"
          type="search"
          name="contract-search"
          placeholder="Título, empresa…"
          class="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-4 text-base text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-orange-400/60"
        >
      </label>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="metric in metrics"
          :key="metric.id"
          type="button"
          class="rounded-xl px-4 py-2 text-sm"
          :class="
            metric.enabled
              ? 'bg-orange-500/20 text-orange-200 ring-1 ring-orange-400/40'
              : 'bg-zinc-900 text-zinc-500 ring-1 ring-white/5'
          "
          :disabled="!metric.enabled"
          :title="metric.enabled ? undefined : 'Próximamente'"
        >
          {{ metric.label }}
          <span v-if="!metric.enabled" class="ml-2 text-xs">Próximamente</span>
        </button>
      </div>

      <p v-if="statusMessage" class="text-sm text-zinc-400">
        {{ statusMessage }}
      </p>

      <ul
        v-else
        class="flex flex-col gap-4"
      >
        <li
          v-for="contract in filteredContracts"
          :key="contract.id"
          class="rounded-xl border border-white/10 bg-zinc-900/60 p-4"
        >
          <p class="text-sm font-medium text-zinc-100">
            {{ contract.title }}
          </p>
          <p class="mt-2 text-sm text-zinc-400">
            {{ contract.awardeeName ?? 'Adjudicatario no disponible' }}
          </p>
          <p class="mt-2 text-base font-semibold text-orange-300">
            {{
              contract.awardedAmountEur == null
                ? 'Importe no disponible'
                : formatEur(contract.awardedAmountEur)
            }}
          </p>
        </li>
        <li
          v-if="filteredContracts.length === 0"
          class="text-sm text-zinc-400"
        >
          Ningún contrato coincide con la búsqueda
        </li>
      </ul>
    </div>

    <p
      class="w-fit rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-xs tracking-wide text-zinc-400 uppercase"
    >
      Datos PLACSP · {{ santanderMunicipality.name }}
    </p>
  </aside>
</template>
