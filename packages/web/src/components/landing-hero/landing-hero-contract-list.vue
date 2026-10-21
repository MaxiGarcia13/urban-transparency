<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import PublicContractCard from '@/components/public-contract/public-contract-card.vue';
import { cantabriaRegion } from '@/config/regions/cantabria';

defineProps<{
  contracts: PublicContract[];
  statusMessage: string | null;
}>();

const emit = defineEmits<{
  select: [contract: PublicContract];
}>();
</script>

<template>
  <p v-if="statusMessage" class="text-sm text-zinc-400">
    {{ statusMessage }}
  </p>

  <ul
    v-else
    class="flex flex-col gap-4"
  >
    <li
      v-for="contract in contracts"
      :key="contract.id"
    >
      <PublicContractCard
        :contract="contract"
        @select="emit('select', $event)"
      />
    </li>
    <li
      v-if="contracts.length === 0"
      class="text-sm text-zinc-400"
    >
      Ningún contrato coincide con los filtros
    </li>
  </ul>

  <p
    class="w-fit rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-xs tracking-wide text-zinc-400 uppercase"
  >
    Datos PLACSP · {{ cantabriaRegion.name }}
  </p>
</template>
