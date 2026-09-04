import { isCurrentCalendarMonth } from '@/components/public-cloud/finance/finance-measure-utils';
import prisma from '@/core/prisma';
import { Provider, SpendFlagRuleId } from '@/prisma/client';
import { activeActualSpendWhere } from '../active-spend';
import { FINANCE_ANOMALY_THRESHOLDS } from '../constants';
import { isUniqueConstraintError } from './ingest-errors';
import type { BillingPeriod } from './types';

type ServiceLineAmount = {
  licencePlate: string;
  provider: Provider;
  serviceLine: string;
  amountCad: number;
};

type SpendFlagInput = {
  licencePlate: string;
  provider: Provider;
  serviceLine?: string | null;
  year: number;
  month: number;
  ruleId: SpendFlagRuleId;
  currentAmountCad: number;
  priorAmountCad?: number | null;
};

function priorPeriod(period: BillingPeriod): BillingPeriod {
  if (period.month === 1) return { year: period.year - 1, month: 12 };
  return { year: period.year, month: period.month - 1 };
}

async function loadFlagEvaluationData(period: BillingPeriod) {
  const prior = priorPeriod(period);

  const [rollups, priorRollups, forecasts, currentLines, historicalServiceLines] = await Promise.all([
    prisma.monthlyProductSpendRollup.findMany({
      where: { year: period.year, month: period.month },
    }),
    prisma.monthlyProductSpendRollup.findMany({
      where: { year: prior.year, month: prior.month },
    }),
    prisma.cloudCostForecast.findMany({
      select: { licencePlate: true, monthlyValues: true },
    }),
    prisma.actualSpend.findMany({
      where: { year: period.year, month: period.month, ...activeActualSpendWhere },
      select: { licencePlate: true, provider: true, serviceLine: true, amountCad: true },
    }),
    prisma.actualSpend.findMany({
      where: {
        OR: [{ year: { lt: period.year } }, { year: period.year, month: { lt: period.month } }],
      },
      select: { licencePlate: true, provider: true, serviceLine: true },
      distinct: ['licencePlate', 'provider', 'serviceLine'],
    }),
  ]);

  const priorByKey = new Map(priorRollups.map((r) => [`${r.licencePlate}:${r.provider}`, r.amountCad]));
  const forecastByPlateMonth = new Map<string, number>();
  for (const forecast of forecasts) {
    for (const value of forecast.monthlyValues) {
      if (value.year === period.year && value.month === period.month) {
        forecastByPlateMonth.set(forecast.licencePlate, value.amount);
      }
    }
  }
  const seenService = new Set(historicalServiceLines.map((l) => `${l.licencePlate}:${l.provider}:${l.serviceLine}`));

  return { rollups, priorByKey, forecastByPlateMonth, currentLines, seenService };
}

function collectMomIncreaseFlags(
  period: BillingPeriod,
  rollups: Awaited<ReturnType<typeof loadFlagEvaluationData>>['rollups'],
  priorByKey: Map<string, number>,
): SpendFlagInput[] {
  const flags: SpendFlagInput[] = [];
  for (const rollup of rollups) {
    const priorAmount = priorByKey.get(`${rollup.licencePlate}:${rollup.provider}`);
    if (priorAmount === undefined || priorAmount <= 0) continue;
    const increasePct = ((rollup.amountCad - priorAmount) / priorAmount) * 100;
    if (increasePct <= FINANCE_ANOMALY_THRESHOLDS.momIncreasePercent) continue;
    flags.push({
      licencePlate: rollup.licencePlate,
      provider: rollup.provider,
      year: period.year,
      month: period.month,
      ruleId: SpendFlagRuleId.MOM_INCREASE,
      currentAmountCad: rollup.amountCad,
      priorAmountCad: priorAmount,
    });
  }
  return flags;
}

function collectOverForecastFlags(
  period: BillingPeriod,
  rollups: Awaited<ReturnType<typeof loadFlagEvaluationData>>['rollups'],
  forecastByPlateMonth: Map<string, number>,
): SpendFlagInput[] {
  const amountByPlate = new Map<string, { amountCad: number; provider: (typeof rollups)[number]['provider'] }>();
  for (const rollup of rollups) {
    const current = amountByPlate.get(rollup.licencePlate);
    if (current) current.amountCad += rollup.amountCad;
    else amountByPlate.set(rollup.licencePlate, { amountCad: rollup.amountCad, provider: rollup.provider });
  }

  const flags: SpendFlagInput[] = [];
  for (const [licencePlate, row] of amountByPlate) {
    const forecast = forecastByPlateMonth.get(licencePlate);
    if (forecast === undefined || forecast <= 0) continue;
    const overPct = ((row.amountCad - forecast) / forecast) * 100;
    if (overPct <= FINANCE_ANOMALY_THRESHOLDS.overForecastPercent) continue;
    flags.push({
      licencePlate,
      provider: row.provider,
      year: period.year,
      month: period.month,
      ruleId: SpendFlagRuleId.OVER_FORECAST,
      currentAmountCad: row.amountCad,
      priorAmountCad: forecast,
    });
  }
  return flags;
}

function collectMomAndOverForecastFlags(
  period: BillingPeriod,
  rollups: Awaited<ReturnType<typeof loadFlagEvaluationData>>['rollups'],
  priorByKey: Map<string, number>,
  forecastByPlateMonth: Map<string, number>,
): SpendFlagInput[] {
  return [
    ...collectMomIncreaseFlags(period, rollups, priorByKey),
    ...collectOverForecastFlags(period, rollups, forecastByPlateMonth),
  ];
}

function collectNewServiceLineFlags(
  period: BillingPeriod,
  currentLines: ServiceLineAmount[],
  seenService: Set<string>,
): SpendFlagInput[] {
  const serviceTotals = new Map<string, ServiceLineAmount>();
  for (const line of currentLines) {
    const key = `${line.licencePlate}:${line.provider}:${line.serviceLine}`;
    const existing = serviceTotals.get(key);
    if (existing) {
      existing.amountCad += line.amountCad;
    } else {
      serviceTotals.set(key, { ...line });
    }
  }

  const flags: SpendFlagInput[] = [];
  for (const [key, line] of serviceTotals) {
    if (seenService.has(key)) continue;
    if (line.amountCad < FINANCE_ANOMALY_THRESHOLDS.newServiceLineMinCad) continue;
    flags.push({
      licencePlate: line.licencePlate,
      provider: line.provider,
      serviceLine: line.serviceLine,
      year: period.year,
      month: period.month,
      ruleId: SpendFlagRuleId.NEW_SERVICE_LINE,
      currentAmountCad: line.amountCad,
    });
  }
  return flags;
}

export function spendFlagKey(flag: Pick<SpendFlagInput, 'licencePlate' | 'provider' | 'serviceLine' | 'ruleId'>) {
  return `${flag.licencePlate}:${flag.provider}:${flag.serviceLine ?? ''}:${flag.ruleId}`;
}

export function planSpendFlagReconcile(
  existing: Array<{ id: string; currentAmountCad: number; priorAmountCad?: number | null } & SpendFlagInput>,
  next: SpendFlagInput[],
  reviewedKeys: Iterable<string> = [],
) {
  const existingByKey = new Map(existing.map((row) => [spendFlagKey(row), row]));
  const reviewed = reviewedKeys instanceof Set ? reviewedKeys : new Set(reviewedKeys);
  const nextKeys = new Set(next.map(spendFlagKey));
  return {
    staleIds: existing.filter((row) => !nextKeys.has(spendFlagKey(row))).map((row) => row.id),
    toCreate: next.filter((flag) => !existingByKey.has(spendFlagKey(flag)) && !reviewed.has(spendFlagKey(flag))),
    toUpdate: next.flatMap((flag) => {
      const current = existingByKey.get(spendFlagKey(flag));
      if (!current) return [];
      if (
        current.currentAmountCad === flag.currentAmountCad &&
        (current.priorAmountCad ?? undefined) === flag.priorAmountCad
      ) {
        return [];
      }
      return [{ id: current.id, currentAmountCad: flag.currentAmountCad, priorAmountCad: flag.priorAmountCad }];
    }),
  };
}

export function shouldEvaluateSpendFlags(period: BillingPeriod, now = new Date()) {
  return !isCurrentCalendarMonth(period.year, period.month, now);
}

function spendFlagCreateData(flag: SpendFlagInput) {
  return { ...flag, serviceLine: flag.serviceLine ?? '' };
}

async function applySpendFlagPlan(plan: ReturnType<typeof planSpendFlagReconcile>) {
  if (plan.staleIds.length > 0) {
    await prisma.spendFlag.deleteMany({ where: { id: { in: plan.staleIds } } });
  }
  for (const flag of plan.toCreate) {
    try {
      await prisma.spendFlag.create({ data: spendFlagCreateData(flag) });
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
    }
  }
  const batchSize = 25;
  for (let index = 0; index < plan.toUpdate.length; index += batchSize) {
    await Promise.all(
      plan.toUpdate.slice(index, index + batchSize).map((row) =>
        prisma.spendFlag.update({
          where: { id: row.id },
          data: { currentAmountCad: row.currentAmountCad, priorAmountCad: row.priorAmountCad },
        }),
      ),
    );
  }
}

export async function evaluateSpendFlagsForPeriod(period: BillingPeriod) {
  if (!shouldEvaluateSpendFlags(period)) return 0;

  const { rollups, priorByKey, forecastByPlateMonth, currentLines, seenService } = await loadFlagEvaluationData(period);

  const flags = [
    ...collectMomAndOverForecastFlags(period, rollups, priorByKey, forecastByPlateMonth),
    ...collectNewServiceLineFlags(period, currentLines, seenService),
  ];

  const existing = await prisma.spendFlag.findMany({
    where: { year: period.year, month: period.month },
  });
  const reviewedKeys = existing.filter((row) => row.reviewedAt).map(spendFlagKey);
  const unreviewed = existing.filter((row) => !row.reviewedAt);
  await applySpendFlagPlan(planSpendFlagReconcile(unreviewed, flags, reviewedKeys));

  return flags.length;
}
