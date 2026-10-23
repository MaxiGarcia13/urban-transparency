<script setup lang="ts">
import type { MunicipalBusinessStats } from '@urban-transparency/shared';
import type { MunicipalBusinessRankingRow } from '@/domain/municipal-business';
import { computed } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { sectorBreakdownForMunicipality } from '@/domain/municipal-business';
import { formatInteger } from '@/utils/format-integer';
import { formatPercent } from '@/utils/format-percent';
import BusinessSectorCompositionList from './business-sector-composition-list.vue';

const props = defineProps<{
  municipality: MunicipalBusinessRankingRow | null;
  rows: MunicipalBusinessStats[];
}>();

const emit = defineEmits<{
  close: [];
}>();

const isOpen = computed({
  get: () => props.municipality != null,
  set: (open) => {
    if (!open) {
      emit('close');
    }
  },
});

const composition = computed(() => {
  if (props.municipality == null) {
    return [];
  }
  return sectorBreakdownForMunicipality(
    props.rows,
    props.municipality.municipalityCode,
    props.municipality.periodYear,
  );
});

const summary = computed(() => {
  const municipality = props.municipality;
  if (municipality == null) {
    return '';
  }
  const parts: string[] = [];
  if (municipality.activeBusinessCount != null) {
    parts.push(`${formatInteger(municipality.activeBusinessCount)} empresas`);
  } else {
    parts.push('Sin dato publicado');
  }
  if (municipality.shareOfRegion != null) {
    parts.push(`${formatPercent(municipality.shareOfRegion)} de la región`);
  }
  parts.push(String(municipality.periodYear));
  return parts.join(' · ');
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-h-[min(90vh,40rem)] gap-6 overflow-hidden sm:max-w-lg">
      <DialogHeader v-if="municipality">
        <DialogTitle>
          {{ municipality.municipalityName }}
        </DialogTitle>
        <DialogDescription>
          {{ summary }}
        </DialogDescription>
      </DialogHeader>

      <div class="min-h-0 overflow-y-auto overscroll-contain pr-1">
        <BusinessSectorCompositionList :composition="composition" />
      </div>
    </DialogContent>
  </Dialog>
</template>
