import { createGlobalValtio } from '@/helpers/valtio';
import { PeriodCosts, CostPeriod } from '@/types/private-cloud';

export const { state: costState, useValtioState: useCostState } = createGlobalValtio<{
  selectedDate: Date;
  period: CostPeriod;
  forecast: boolean;
  data: PeriodCosts | null;
  isDataLoading: boolean;
}>({
  selectedDate: new Date(),
  period: CostPeriod.Monthly,
  forecast: false,
  data: null,
  isDataLoading: false,
});
