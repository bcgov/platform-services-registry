import { IS_PROD } from '@/config';
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

export const PUBLIC_CLOUD_FINANCE_PREVIEW_ENABLED = !IS_PROD || process.env.PUBLIC_CLOUD_FINANCE_PREVIEW === 'true';

export function isPublicCloudFinancePreviewEnabled(isProd = IS_PROD) {
  if (!isProd) return true;
  return process.env.PUBLIC_CLOUD_FINANCE_PREVIEW === 'true';
}
