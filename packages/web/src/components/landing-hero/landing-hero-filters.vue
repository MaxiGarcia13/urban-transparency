<script setup lang="ts">
import type { PublicContractStatus } from '@urban-transparency/shared';
import { computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FILTERABLE_PUBLIC_CONTRACT_STATUSES } from '@/domain/filter-public-contracts';
import { cn } from '@/lib/utils';
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

const yearFromValue = computed({
  get: () => (yearFrom.value == null ? 'all' : String(yearFrom.value)),
  set: (value: string) => {
    const year = value === 'all' ? null : Number(value);
    yearFrom.value = year != null && Number.isFinite(year) ? year : null;
    if (
      yearFrom.value != null
      && yearTo.value != null
      && yearFrom.value > yearTo.value
    ) {
      yearTo.value = yearFrom.value;
    }
  },
});

const yearToValue = computed({
  get: () => (yearTo.value == null ? 'all' : String(yearTo.value)),
  set: (value: string) => {
    const year = value === 'all' ? null : Number(value);
    yearTo.value = year != null && Number.isFinite(year) ? year : null;
    if (
      yearTo.value != null
      && yearFrom.value != null
      && yearTo.value < yearFrom.value
    ) {
      yearFrom.value = yearTo.value;
    }
  },
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
</script>

<template>
  <div class="flex flex-col gap-2">
    <Label
      for="contract-search"
      class="text-sm text-muted-foreground"
    >
      Busca un contrato o adjudicatario
    </Label>
    <Input
      id="contract-search"
      v-model="searchQuery"
      type="search"
      name="contract-search"
      placeholder="Título, empresa…"
      class="h-auto rounded-xl border-border bg-card px-4 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-ring md:py-4"
    />
  </div>

  <fieldset class="flex flex-col gap-2">
    <legend class="text-sm text-muted-foreground">
      Estado
    </legend>
    <div class="flex flex-wrap gap-2">
      <Button
        v-for="status in FILTERABLE_PUBLIC_CONTRACT_STATUSES"
        :key="status"
        type="button"
        variant="outline"
        size="sm"
        :aria-pressed="isStatusSelected(status)"
        :class="cn(
          'h-auto rounded-xl px-4 py-2 text-sm',
          isStatusSelected(status)
            ? 'border-transparent bg-accent text-accent-foreground ring-1 ring-orange-400/40'
            : 'border-transparent bg-card text-muted-foreground ring-1 ring-white/5 hover:bg-card hover:text-muted-foreground',
        )"
        @click="toggleStatus(status)"
      >
        {{ formatPublicContractStatus(status) }}
      </Button>
    </div>
  </fieldset>

  <div class="flex flex-col gap-2">
    <p class="text-sm text-muted-foreground">
      Año
    </p>
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-2">
        <Label class="text-xs tracking-wide text-muted-foreground uppercase">
          Desde
        </Label>
        <Select
          v-model="yearFromValue"
          :disabled="availableYears.length === 0"
        >
          <SelectTrigger
            class="h-auto w-full rounded-xl border-border bg-card px-4 py-2 text-sm text-foreground"
          >
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              Todos
            </SelectItem>
            <SelectItem
              v-for="year in availableYears"
              :key="`from-${year}`"
              :value="String(year)"
            >
              {{ year }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex flex-col gap-2">
        <Label class="text-xs tracking-wide text-muted-foreground uppercase">
          Hasta
        </Label>
        <Select
          v-model="yearToValue"
          :disabled="availableYears.length === 0"
        >
          <SelectTrigger
            class="h-auto w-full rounded-xl border-border bg-card px-4 py-2 text-sm text-foreground"
          >
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              Todos
            </SelectItem>
            <SelectItem
              v-for="year in availableYears"
              :key="`to-${year}`"
              :value="String(year)"
            >
              {{ year }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
</template>
