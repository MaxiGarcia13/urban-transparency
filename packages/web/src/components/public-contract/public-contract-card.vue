<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import { Card, CardContent } from '@/components/ui/card';
import PublicContractCardBody from './public-contract-card-body.vue';

defineProps<{
  contract: PublicContract;
}>();

const emit = defineEmits<{
  select: [contract: PublicContract];
}>();
</script>

<template>
  <Card
    role="button"
    tabindex="0"
    class="w-full cursor-pointer bg-card/60 py-0 transition-colors hover:bg-card hover:ring-orange-400/40"
    @click="emit('select', contract)"
    @keydown.enter="emit('select', contract)"
    @keydown.space.prevent="emit('select', contract)"
  >
    <CardContent class="p-4">
      <PublicContractCardBody :contract="contract" />
    </CardContent>
  </Card>
</template>
