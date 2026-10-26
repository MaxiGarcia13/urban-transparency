<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
import { formatEur } from '@/utils/format-eur';
import { formatInteger } from '@/utils/format-integer';
import { formatSignedPercent } from '@/utils/format-signed-percent';

withDefaults(
  defineProps<{
    joinYear: number | null;
    totalActiveBusinesses: number | null;
    meanIncome: number | null;
    measureLabel: string;
    businessYearOverYear: number | null;
    incomeYearOverYear: number | null;
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
    class="flex flex-col gap-4"
    aria-hidden="true"
  >
    <Skeleton class="h-4 w-24 rounded-xl" />
    <Skeleton class="h-8 w-40 rounded-xl bg-teal-950/80 md:h-9" />
    <Skeleton class="h-8 w-36 rounded-xl bg-sky-950/80 md:h-9" />
  </div>
  <div
    v-else
    class="flex flex-col gap-4"
  >
    <p
      v-if="joinYear != null"
      class="text-sm text-muted-foreground"
    >
      Cruce DIRCE · ADRH {{ joinYear }}
    </p>

    <div
      v-if="totalActiveBusinesses != null && totalActiveBusinesses > 0"
      class="flex flex-col gap-1"
    >
      <p class="text-2xl font-semibold text-teal-300 md:text-3xl">
        {{ formatInteger(totalActiveBusinesses) }}
        <span class="text-base font-normal text-muted-foreground md:text-lg">
          empresas
        </span>
      </p>
      <p
        v-if="businessYearOverYear != null"
        class="text-sm text-muted-foreground"
      >
        <span
          :class="businessYearOverYear >= 0 ? 'text-teal-300/90' : 'text-orange-300/90'"
        >
          {{ formatSignedPercent(businessYearOverYear) }}
        </span>
        empresas vs año anterior
      </p>
    </div>

    <div
      v-if="meanIncome != null && meanIncome > 0"
      class="flex flex-col gap-1"
    >
      <p class="text-2xl font-semibold text-sky-300 md:text-3xl">
        {{ formatEur(meanIncome) }}
        <span class="text-base font-normal text-muted-foreground md:text-lg">
          media provincial
        </span>
      </p>
      <p class="text-sm text-muted-foreground">
        {{ measureLabel }}
        <template v-if="incomeYearOverYear != null">
          ·
          <span
            :class="incomeYearOverYear >= 0 ? 'text-sky-300/90' : 'text-orange-300/90'"
          >
            {{ formatSignedPercent(incomeYearOverYear) }}
          </span>
          vs año anterior
        </template>
      </p>
    </div>
  </div>
</template>
