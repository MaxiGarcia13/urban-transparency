<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
import { formatEur } from '@/utils/format-eur';
import { formatSignedPercent } from '@/utils/format-signed-percent';

withDefaults(
  defineProps<{
    meanIncome: number | null;
    periodYear: number | null;
    measureLabel: string;
    yearOverYear: number | null;
    isLoading?: boolean;
  }>(),
  {
    isLoading: false,
  },
);
</script>

<template>
  <div
    v-if="isLoading"
    class="flex flex-col gap-2"
    aria-hidden="true"
  >
    <Skeleton class="h-4 w-24 rounded-xl" />
    <Skeleton class="h-8 w-36 rounded-xl bg-sky-950/80 md:h-9" />
    <Skeleton class="h-4 w-48 rounded-xl" />
  </div>
  <div
    v-else-if="meanIncome != null && meanIncome > 0"
    class="flex flex-col gap-2"
  >
    <p class="text-sm text-muted-foreground">
      Media provincial
      <template v-if="periodYear != null">
        · ADRH {{ periodYear }}
      </template>
    </p>
    <p class="text-2xl font-semibold text-sky-300 md:text-3xl">
      {{ formatEur(meanIncome) }}
      <span class="text-base font-normal text-muted-foreground md:text-lg">
        netos / año
      </span>
    </p>
    <p class="text-sm text-muted-foreground">
      {{ measureLabel }}
      <template v-if="yearOverYear != null">
        ·
        <span
          :class="yearOverYear >= 0 ? 'text-sky-300/90' : 'text-orange-300/90'"
        >
          {{ formatSignedPercent(yearOverYear) }}
        </span>
        vs año anterior
      </template>
    </p>
    <p class="text-xs leading-relaxed text-muted-foreground/90 md:text-sm">
      No es la suma de los municipios: es la media oficial de la provincia (INE).
    </p>
  </div>
</template>
