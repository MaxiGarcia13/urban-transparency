<script setup lang="ts">
import type { PublicContractStatus } from '@urban-transparency/shared';
import { Funnel } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { countActivePublicContractFilters } from '@/domain/filter-public-contracts';
import PublicContractFiltersForm from './public-contract-filters-form.vue';

const props = defineProps<{
  availableYears: number[];
}>();

const searchQuery = defineModel<string>('searchQuery', { default: '' });
const selectedStatuses = defineModel<PublicContractStatus[]>('selectedStatuses', {
  default: () => [],
});
const yearFrom = defineModel<number | null>('yearFrom', { default: null });
const yearTo = defineModel<number | null>('yearTo', { default: null });

const isOpen = ref(false);
const draftSearchQuery = ref('');
const draftSelectedStatuses = ref<PublicContractStatus[]>([]);
const draftYearFrom = ref<number | null>(null);
const draftYearTo = ref<number | null>(null);

const activeFilterCount = computed(() =>
  countActivePublicContractFilters({
    searchQuery: searchQuery.value,
    statuses: selectedStatuses.value,
    yearFrom: yearFrom.value,
    yearTo: yearTo.value,
  }),
);

const filterButtonLabel = computed(() =>
  activeFilterCount.value > 0
    ? `Filtros · ${activeFilterCount.value}`
    : 'Filtros',
);

function syncDraftFromApplied(): void {
  draftSearchQuery.value = searchQuery.value;
  draftSelectedStatuses.value = [...selectedStatuses.value];
  draftYearFrom.value = yearFrom.value;
  draftYearTo.value = yearTo.value;
}

function applyDraft(): void {
  searchQuery.value = draftSearchQuery.value;
  selectedStatuses.value = [...draftSelectedStatuses.value];
  yearFrom.value = draftYearFrom.value;
  yearTo.value = draftYearTo.value;
  isOpen.value = false;
}

function clearFilters(): void {
  draftSearchQuery.value = '';
  draftSelectedStatuses.value = [];
  draftYearFrom.value = null;
  draftYearTo.value = null;
  searchQuery.value = '';
  selectedStatuses.value = [];
  yearFrom.value = null;
  yearTo.value = null;
  isOpen.value = false;
}

watch(isOpen, (open) => {
  if (open) {
    syncDraftFromApplied();
  }
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <Button
      type="button"
      variant="outline"
      class="pointer-events-auto h-auto gap-2 rounded-xl border-border bg-card/90 px-4 py-2 text-sm text-foreground shadow-lg backdrop-blur-md"
      :aria-label="filterButtonLabel"
      @click="isOpen = true"
    >
      <Funnel class="size-4" />
      <span>{{ filterButtonLabel }}</span>
    </Button>

    <DialogContent class="gap-6 sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Filtros</DialogTitle>
        <DialogDescription>
          Acota los contratos visibles en el mapa y la lista.
        </DialogDescription>
      </DialogHeader>

      <PublicContractFiltersForm
        v-model:search-query="draftSearchQuery"
        v-model:selected-statuses="draftSelectedStatuses"
        v-model:year-from="draftYearFrom"
        v-model:year-to="draftYearTo"
        :available-years="props.availableYears"
      />

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          class="rounded-xl"
          @click="clearFilters"
        >
          Limpiar
        </Button>
        <Button
          type="button"
          class="rounded-xl"
          @click="applyDraft"
        >
          Aplicar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
