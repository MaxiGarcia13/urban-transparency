<script setup lang="ts">
import type { MunicipalBusinessRankingRow } from '@/domain/municipal-business';
import { computed, ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BUSINESS_POWER_TOP_RANKING_LIMIT } from '@/domain/municipal-business';
import ShareMetricRow from './share-metric-row.vue';

const props = defineProps<{
  ranking: MunicipalBusinessRankingRow[];
  regionName: string;
  isLoading: boolean;
  statusMessage: string | null;
  selectedMunicipalityCode: string | null;
}>();

const emit = defineEmits<{
  select: [municipalityCode: string];
}>();

const showAll = ref(false);

watch(
  () => props.ranking,
  () => {
    showAll.value = false;
  },
);

const visibleRanking = computed(() =>
  showAll.value
    ? props.ranking
    : props.ranking.slice(0, BUSINESS_POWER_TOP_RANKING_LIMIT),
);

const hasMore = computed(
  () => props.ranking.length > BUSINESS_POWER_TOP_RANKING_LIMIT,
);
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <h2 class="text-sm font-medium tracking-wide text-teal-300/90 uppercase">
        Ranking municipal
      </h2>
      <p class="text-sm text-muted-foreground">
        <template v-if="!showAll && hasMore">
          Top {{ BUSINESS_POWER_TOP_RANKING_LIMIT }} en {{ regionName }}
        </template>
        <template v-else>
          Municipios en {{ regionName }}
        </template>
      </p>
    </div>

    <div
      v-if="isLoading"
      class="flex flex-col gap-3"
      aria-hidden="true"
    >
      <Skeleton
        v-for="index in 8"
        :key="index"
        class="h-12 w-full rounded-lg"
      />
    </div>

    <p
      v-else-if="statusMessage"
      class="text-sm text-muted-foreground"
    >
      {{ statusMessage }}
    </p>

    <template v-else>
      <ul class="flex flex-col gap-3">
        <li
          v-for="(row, index) in visibleRanking"
          :key="row.municipalityCode"
        >
          <button
            type="button"
            class="w-full rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.03]"
            :class="selectedMunicipalityCode === row.municipalityCode
              ? 'bg-teal-400/5'
              : ''"
            :aria-pressed="selectedMunicipalityCode === row.municipalityCode"
            @click="emit('select', row.municipalityCode)"
          >
            <ShareMetricRow
              :rank="index + 1"
              :label="row.municipalityName"
              :count="row.activeBusinessCount"
              :share="row.shareOfRegion"
            />
          </button>
        </li>
      </ul>

      <Button
        v-if="hasMore"
        type="button"
        variant="ghost"
        class="self-start rounded-xl text-muted-foreground hover:text-teal-200"
        @click="showAll = !showAll"
      >
        {{ showAll
          ? 'Ver solo el top'
          : `Ver los ${ranking.length} municipios` }}
      </Button>
    </template>
  </section>
</template>
