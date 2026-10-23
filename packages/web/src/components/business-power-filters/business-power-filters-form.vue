<script setup lang="ts">
import type { DirceSectorCode } from '@urban-transparency/shared';
import { computed } from 'vue';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BUSINESS_POWER_SECTOR_OPTIONS } from '@/domain/business-power-filters';

defineProps<{
  availableYears: number[];
}>();

const periodYear = defineModel<number | null>('periodYear', { default: null });
const sectorCode = defineModel<DirceSectorCode>('sectorCode', {
  default: 'TOTAL',
});

const yearValue = computed({
  get: () => (periodYear.value == null ? 'latest' : String(periodYear.value)),
  set: (value: string) => {
    if (value === 'latest') {
      periodYear.value = null;
      return;
    }
    const year = Number(value);
    periodYear.value = Number.isFinite(year) ? year : null;
  },
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <Label class="text-sm text-muted-foreground">
        Año
      </Label>
      <Select v-model="yearValue">
        <SelectTrigger class="w-full rounded-xl">
          <SelectValue placeholder="Último disponible" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">
            Último disponible
          </SelectItem>
          <SelectItem
            v-for="year in availableYears"
            :key="year"
            :value="String(year)"
          >
            {{ year }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="flex flex-col gap-2">
      <Label class="text-sm text-muted-foreground">
        Sector
      </Label>
      <Select v-model="sectorCode">
        <SelectTrigger class="w-full rounded-xl">
          <SelectValue placeholder="Total" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in BUSINESS_POWER_SECTOR_OPTIONS"
            :key="option.code"
            :value="option.code"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
