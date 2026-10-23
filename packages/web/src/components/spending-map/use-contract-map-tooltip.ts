import type { ContractSpendingTooltipState } from './contract-spending-tooltip-state';
import type { ContractMapCluster } from './group-contract-map-points';
import { onKeyStroke } from '@vueuse/core';
import { shallowRef } from 'vue';

export function useContractMapTooltip() {
  const tooltip = shallowRef<ContractSpendingTooltipState | null>(null);
  const selectedClusterId = shallowRef<string | null>(null);
  const expandableCluster = shallowRef<ContractMapCluster | null>(null);

  function clearTooltip(): void {
    tooltip.value = null;
    selectedClusterId.value = null;
    expandableCluster.value = null;
  }

  function openCluster(cluster: ContractMapCluster, x: number, y: number): void {
    selectedClusterId.value = cluster.id;
    expandableCluster.value = null;
    tooltip.value = {
      contracts: cluster.contracts,
      contractCount: cluster.contractCount,
      totalAwardedEur: cluster.totalAwardedEur,
      postalCode: cluster.postalCode,
      hasKnownLocation: cluster.hasKnownLocation,
      x,
      y,
      expandableSiblingCount: 0,
    };
  }

  function openFocusedContract(
    cluster: ContractMapCluster,
    contractId: string,
    x: number,
    y: number,
  ): void {
    const focused = cluster.contracts.find((contract) => contract.id === contractId);
    if (!focused) {
      openCluster(cluster, x, y);
      return;
    }

    selectedClusterId.value = cluster.id;
    const siblingCount = cluster.contractCount - 1;
    expandableCluster.value = siblingCount > 0 ? cluster : null;
    tooltip.value = {
      contracts: [focused],
      contractCount: 1,
      totalAwardedEur: focused.awardedAmountEur,
      postalCode: cluster.postalCode,
      hasKnownLocation: cluster.hasKnownLocation,
      x,
      y,
      expandableSiblingCount: siblingCount,
    };
  }

  function expandFocusedCluster(): void {
    const cluster = expandableCluster.value;
    const current = tooltip.value;
    if (!cluster || !current) {
      return;
    }
    openCluster(cluster, current.x, current.y);
  }

  function selectCluster(cluster: ContractMapCluster, x: number, y: number): void {
    if (selectedClusterId.value === cluster.id) {
      clearTooltip();
      return;
    }
    openCluster(cluster, x, y);
  }

  onKeyStroke('Escape', () => {
    clearTooltip();
  });

  return {
    tooltip,
    clearTooltip,
    openCluster,
    openFocusedContract,
    expandFocusedCluster,
    selectCluster,
  };
}
