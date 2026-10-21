<script setup lang="ts">
import type { PublicContract } from '@urban-transparency/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <p class="text-sm font-medium text-balance text-card-foreground">
      {{ contract.title }}
    </p>
    <Badge
      variant="outline"
      class="mt-2 border-transparent bg-transparent px-0 text-xs tracking-wide"
      :class="publicContractStatusTextClass(contract.status)"
    >
      {{ formatPublicContractStatus(contract.status) }}
    </Badge>
    <p class="mt-2 text-sm text-muted-foreground">
      Órgano:
      {{
        formatPartyDisplayName(
          contract.contractingPartyName,
          contract.contractingPartyNif,
        )
      }}
    </p>
    <p class="mt-2 text-sm text-muted-foreground">
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
      class="mt-2 text-xs text-muted-foreground"
    >
      {{ formatPublicContractCardDate(contract) }}
    </p>
    <p
      v-if="contract.postalCode"
      class="mt-2 text-xs tracking-wide text-muted-foreground uppercase"
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
    <Button
      v-if="contract.detailUrl"
      as="a"
      variant="link"
      :href="contract.detailUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-2 h-auto px-0! text-sm text-orange-300"
      @click.stop
      @keydown.stop
    >
      Ver en la Plataforma de Contratación
    </Button>
  </div>
</template>
