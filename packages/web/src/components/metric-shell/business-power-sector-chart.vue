<script setup lang="ts">
import type { BusinessSectorCompositionRow } from '@/domain/municipal-business';
import { Skeleton } from '@/components/ui/skeleton';
import BusinessSectorCompositionList from './business-sector-composition-list.vue';

withDefaults(
  defineProps<{
    composition: BusinessSectorCompositionRow[];
    isLoading?: boolean;
  }>(),
  {
    isLoading: false,
  },
);
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <h2 class="text-sm font-medium tracking-wide text-teal-300/90 uppercase">
        Composición sectorial
      </h2>
      <p class="text-sm text-muted-foreground">
        Peso de cada grupo CNAE en la región
      </p>
    </div>

    <div
      v-if="isLoading"
      class="flex flex-col gap-3"
      aria-hidden="true"
    >
      <Skeleton
        v-for="index in 6"
        :key="index"
        class="h-8 w-full rounded-lg"
      />
    </div>

    <BusinessSectorCompositionList
      v-else
      :composition="composition"
    />
  </section>
</template>
