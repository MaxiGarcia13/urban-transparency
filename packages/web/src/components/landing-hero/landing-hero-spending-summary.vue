<script setup lang="ts">
import type { MunicipalSpending } from '@/domain/aggregate-municipal-spending';
import { Skeleton } from '@/components/ui/skeleton';
import { formatEur } from '@/utils/format-eur';

withDefaults(
  defineProps<{
    spending: MunicipalSpending | null;
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
    <Skeleton class="h-8 w-36 rounded-xl bg-orange-950/80 md:h-9" />
  </div>
  <div
    v-else-if="spending && spending.contractCount > 0"
    class="flex flex-col gap-2"
  >
    <p class="text-sm text-muted-foreground">
      {{ spending.contractCount }}
      {{ spending.contractCount === 1 ? 'contrato' : 'contratos' }}
    </p>
    <p class="text-2xl font-semibold text-orange-300 md:text-3xl">
      {{ formatEur(spending.totalAwardedEur) }}
    </p>
  </div>
</template>
