import { createGlobalValtio } from '@/helpers/valtio';
import { PeriodCosts, CostPeriod } from '@/types/private-cloud';

export const { state: costState, useValtioState: useCostState } = createGlobalValtio<{
  selectedDate: Date;
  period: CostPeriod;
  forecastEnabled: boolean;
  data: PeriodCosts | null;
}>({
  selectedDate: new Date(),
  period: CostPeriod.Monthly,
  forecastEnabled: false,
  data: null,
});
