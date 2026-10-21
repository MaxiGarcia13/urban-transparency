<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import PublicContractCardBody from './public-contract-card-body.vue';

defineProps<{
  contract: PublicContract;
}>();

const emit = defineEmits<{
  select: [contract: PublicContract];
}>();
</script>

<template>
  <button
    type="button"
    class="w-full rounded-xl border border-white/10 bg-zinc-900/60 p-4 text-left transition-colors hover:border-orange-400/40 hover:bg-zinc-900"
    @click="emit('select', contract)"
  >
    <PublicContractCardBody :contract="contract" />
  </button>
</template>
