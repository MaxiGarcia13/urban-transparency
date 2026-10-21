<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import { formatEur } from '@/utils/format-eur';
import { formatPartyDisplayName } from '@/utils/format-party-display-name';
import { formatPublicContractCardDate } from '@/utils/format-public-contract-card-date';
import {
  formatPublicContractStatus,
  publicContractStatusTextClass,
} from '@/utils/public-contract-status-style';

defineProps<{
  contract: Pick<
    PublicContract,
    | 'title'
    | 'status'
    | 'contractingPartyName'
    | 'contractingPartyNif'
    | 'awardeeName'
    | 'awardeeNif'
    | 'postalCode'
    | 'awardedAmountEur'
    | 'awardedAt'
    | 'sourceEntryUpdatedAt'
    | 'detailUrl'
  >;
}>();
</script>

<template>
  <div>
    <p class="text-sm font-medium text-balance text-zinc-100">
      {{ contract.title }}
    </p>
    <p
      class="mt-2 text-xs tracking-wide"
      :class="publicContractStatusTextClass(contract.status)"
    >
      {{ formatPublicContractStatus(contract.status) }}
    </p>
    <p class="mt-2 text-sm text-zinc-400">
      Órgano:
      {{
        formatPartyDisplayName(
          contract.contractingPartyName,
          contract.contractingPartyNif,
        )
      }}
    </p>
    <p class="mt-2 text-sm text-zinc-400">
      Adjudicatario:
      {{
        formatPartyDisplayName(
          contract.awardeeName,
          contract.awardeeNif,
        ) ?? 'no disponible'
      }}
    </p>
    <p
      v-if="formatPublicContractCardDate(contract)"
      class="mt-2 text-xs text-zinc-500"
    >
      {{ formatPublicContractCardDate(contract) }}
    </p>
    <p
      v-if="contract.postalCode"
      class="mt-2 text-xs tracking-wide text-zinc-500 uppercase"
    >
      CP {{ contract.postalCode }}
    </p>
    <p class="mt-2 text-base font-semibold text-orange-300">
      {{
        contract.awardedAmountEur == null
          ? 'Importe no disponible'
          : formatEur(contract.awardedAmountEur)
      }}
    </p>
    <a
      v-if="contract.detailUrl"
      :href="contract.detailUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-2 inline-block text-sm text-orange-300 underline-offset-2 hover:underline"
      @click.stop
      @keydown.stop
    >
      Ver en la Plataforma de Contratación
    </a>
  </div>
</template>
