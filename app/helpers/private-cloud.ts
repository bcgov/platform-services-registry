import { PeriodCosts, CostDetailTableDataRow } from '@/types/private-cloud';

export function getPeriodCostDetailTableDataRow(costData: PeriodCosts): CostDetailTableDataRow[] {
  return costData.timeUnits.map((timeUnit, idx) => {
    const {
      cpuCostsToDate,
      cpuCostsToProjected,
      cpuCosts,
      storageCostsToDate,
      storageCostsToProjected,
      storageCosts,
      cpuQuotasToDate,
      cpuQuotasToProjected,
      cpuQuotas,
      storageQuotasToDate,
      storageQuotasToProjected,
      storageQuotas,
      costsToDate,
      costsToProjected,
      costs,
      pasts,
    } = costData.timeDetails;

    return {
      timeUnit,
      cpuCostToDate: cpuCostsToDate[idx],
      cpuCostToProjected: cpuCostsToProjected[idx],
      cpuCost: cpuCosts[idx],
      storageCostToDate: storageCostsToDate[idx],
      storageCostToProjected: storageCostsToProjected[idx],
      storageCost: storageCosts[idx],
      cpuQuotaToDate: cpuQuotasToDate[idx],
      cpuQuotaToProjected: cpuQuotasToProjected[idx],
      cpuQuota: cpuQuotas[idx],
      storageQuotaToDate: storageQuotasToDate[idx],
      storageQuotaToProjected: storageQuotasToProjected[idx],
      storageQuota: storageQuotas[idx],
      costToDate: costsToDate[idx],
      costToProjected: costsToProjected[idx],
      cost: costs[idx],
      past: pasts[idx],
    };
  });
}
