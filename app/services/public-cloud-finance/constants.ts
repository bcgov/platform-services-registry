import { SpendFlagRuleId } from '@/prisma/client';

export const FINANCE_ANOMALY_THRESHOLDS = {
  /** Rule 1: month-over-month product spend increase. */
  momIncreasePercent: 50,
  /** Rule 2: actual over forecast percentage (only where forecast exists). */
  overForecastPercent: 25,
  /** Rule 3: first-seen service line minimum amount (CAD). */
  newServiceLineMinCad: 100,
} as const;

export const SPEND_FLAG_RULE_LABELS: Record<SpendFlagRuleId, string> = {
  [SpendFlagRuleId.MOM_INCREASE]: `Month-over-month increase above ${FINANCE_ANOMALY_THRESHOLDS.momIncreasePercent}%`,
  [SpendFlagRuleId.OVER_FORECAST]: `Actual exceeds forecast by more than ${FINANCE_ANOMALY_THRESHOLDS.overForecastPercent}%`,
  [SpendFlagRuleId.NEW_SERVICE_LINE]: `New service line above CA$${FINANCE_ANOMALY_THRESHOLDS.newServiceLineMinCad}`,
};

/** Coverage below this → snapshot degrades to actuals-only (variance not meaningful). */
export const LOW_FORECAST_COVERAGE_PERCENT = 20;
