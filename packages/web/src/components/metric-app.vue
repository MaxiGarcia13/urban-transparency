<script setup lang="ts">
import { ref, watch } from 'vue';
import BusinessPowerPlaceholder from '@/components/business-power-placeholder.vue';
import LandingPage from '@/components/landing-page.vue';
import { useMetricRoute } from '@/composables/use-metric-route';

const { metricId, navigateToMetric } = useMetricRoute();

const hasOpenedPublicSpending = ref(metricId.value === 'public-spending');

watch(metricId, (nextMetricId) => {
  if (nextMetricId === 'public-spending') {
    hasOpenedPublicSpending.value = true;
  }
});
</script>

<template>
  <LandingPage
    v-if="hasOpenedPublicSpending"
    v-show="metricId === 'public-spending'"
    @navigate-metric="navigateToMetric"
  />
  <BusinessPowerPlaceholder
    v-show="metricId === 'business-power'"
    @navigate-metric="navigateToMetric"
  />
</template>
