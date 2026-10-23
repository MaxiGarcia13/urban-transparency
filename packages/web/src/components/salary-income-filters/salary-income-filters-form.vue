<script setup lang="ts">
import type { SalaryIncomeMeasure } from '@/domain/salary-income-filters';
import { computed } from 'vue';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SALARY_INCOME_MEASURE_OPTIONS } from '@/domain/salary-income-filters';

defineProps<{
  availableYears: number[];
}>();

const periodYear = defineModel<number | null>('periodYear', { default: null });
const measure = defineModel<SalaryIncomeMeasure>('measure', {
  default: 'person',
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
        Indicador
      </Label>
      <Select v-model="measure">
        <SelectTrigger class="w-full rounded-xl">
          <SelectValue placeholder="Renta neta media por persona" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in SALARY_INCOME_MEASURE_OPTIONS"
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
