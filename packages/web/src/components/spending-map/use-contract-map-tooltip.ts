import type { ContractSpendingTooltipState } from './contract-spending-tooltip-state';
import type { ContractMapCluster } from './group-contract-map-points';
import { onMounted, onUnmounted, shallowRef } from 'vue';

export function useContractMapTooltip() {
  const tooltip = shallowRef<ContractSpendingTooltipState | null>(null);
  const selectedClusterId = shallowRef<string | null>(null);

  function clearTooltip(): void {
    tooltip.value = null;
    selectedClusterId.value = null;
  }

  function openCluster(cluster: ContractMapCluster, x: number, y: number): void {
    selectedClusterId.value = cluster.id;
    tooltip.value = {
      contracts: cluster.contracts,
      contractCount: cluster.contractCount,
      totalAwardedEur: cluster.totalAwardedEur,
      postalCode: cluster.postalCode,
      hasKnownLocation: cluster.hasKnownLocation,
      x,
      y,
    };
  }

  function selectCluster(cluster: ContractMapCluster, x: number, y: number): void {
    if (selectedClusterId.value === cluster.id) {
      clearTooltip();
      return;
    }
    openCluster(cluster, x, y);
  }

  function handleEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      clearTooltip();
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleEscapeKey);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscapeKey);
  });

  return {
    tooltip,
    clearTooltip,
    openCluster,
    selectCluster,
  };
}
