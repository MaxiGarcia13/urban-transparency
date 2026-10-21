<script setup lang="ts">
import type { PublicContractStatus } from '@urban-transparency/shared';
import { FILTERABLE_PUBLIC_CONTRACT_STATUSES } from '@/domain/filter-public-contracts';
import { formatPublicContractStatus } from '@/utils/public-contract-status-style';

defineProps<{
  availableYears: number[];
}>();

const searchQuery = defineModel<string>('searchQuery', { default: '' });
const selectedStatuses = defineModel<PublicContractStatus[]>('selectedStatuses', {
  default: () => [],
});
const yearFrom = defineModel<number | null>('yearFrom', { default: null });
const yearTo = defineModel<number | null>('yearTo', { default: null });

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
</script>

<template>
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
</template>
