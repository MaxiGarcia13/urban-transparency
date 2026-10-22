<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
import { formatInteger } from '@/utils/format-integer';
import { formatPercent } from '@/utils/format-percent';

withDefaults(
  defineProps<{
    totalActiveBusinesses: number | null;
    periodYear: number | null;
    topShare: number | null;
    yearOverYear: number | null;
    isLoading?: boolean;
  }>(),
  {
    isLoading: false,
  },
);

function formatSignedPercent(value: number): string {
  const absolute = formatPercent(Math.abs(value));
  if (value > 0) {
    return `+${absolute}`;
  }
  if (value < 0) {
    return `−${absolute}`;
  }
  return absolute;
}
</script>

<template>
  <div
    v-if="isLoading"
    class="flex flex-col gap-2"
    aria-hidden="true"
  >
    <Skeleton class="h-4 w-24 rounded-xl" />
    <Skeleton class="h-8 w-36 rounded-xl bg-teal-950/80 md:h-9" />
    <Skeleton class="h-4 w-48 rounded-xl" />
  </div>
  <div
    v-else-if="totalActiveBusinesses != null && totalActiveBusinesses > 0"
    class="flex flex-col gap-2"
  >
    <p class="text-sm text-muted-foreground">
      <template v-if="periodYear != null">
        DIRCE {{ periodYear }}
      </template>
      <template v-else>
        DIRCE
      </template>
    </p>
    <p class="text-2xl font-semibold text-teal-300 md:text-3xl">
      {{ formatInteger(totalActiveBusinesses) }}
      <span class="text-base font-normal text-muted-foreground md:text-lg">
        empresas activas
      </span>
    </p>
    <p
      v-if="topShare != null || yearOverYear != null"
      class="text-sm text-muted-foreground"
    >
      <template v-if="topShare != null">
        Top 3 concentran {{ formatPercent(topShare) }}
      </template>
      <template v-if="topShare != null && yearOverYear != null">
        ·
      </template>
      <template v-if="yearOverYear != null">
        <span
          :class="yearOverYear >= 0 ? 'text-teal-300/90' : 'text-orange-300/90'"
        >
          {{ formatSignedPercent(yearOverYear) }}
        </span>
        vs año anterior
      </template>
    </p>
  </div>
</template>
