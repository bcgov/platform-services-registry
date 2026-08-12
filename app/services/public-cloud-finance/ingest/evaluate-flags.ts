import prisma from '@/core/prisma';
import { Provider, SpendFlagRuleId } from '@/prisma/client';
import { activeActualSpendWhere } from '../active-spend';
import { FINANCE_ANOMALY_THRESHOLDS } from '../constants';
import type { BillingPeriod } from './types';

type ServiceLineAmount = {
  licencePlate: string;
  provider: Provider;
  serviceLine: string;
  amountCad: number;
};

function priorPeriod(period: BillingPeriod): BillingPeriod {
  if (period.month === 1) return { year: period.year - 1, month: 12 };
  return { year: period.year, month: period.month - 1 };
}

export async function evaluateSpendFlagsForPeriod(period: BillingPeriod) {
  const rollups = await prisma.monthlyProductSpendRollup.findMany({
    where: { year: period.year, month: period.month },
  });

  const prior = priorPeriod(period);
  const priorRollups = await prisma.monthlyProductSpendRollup.findMany({
    where: { year: prior.year, month: prior.month },
  });
  const priorByKey = new Map(priorRollups.map((r) => [`${r.licencePlate}:${r.provider}`, r.amountCad]));

  const forecasts = await prisma.cloudCostForecast.findMany({
    select: { licencePlate: true, monthlyValues: true },
  });
  const forecastByPlateMonth = new Map<string, number>();
  for (const forecast of forecasts) {
    for (const value of forecast.monthlyValues) {
      if (value.year === period.year && value.month === period.month) {
        forecastByPlateMonth.set(forecast.licencePlate, value.amount);
      }
    }
  }

  const currentLines = await prisma.actualSpend.findMany({
    where: { year: period.year, month: period.month, ...activeActualSpendWhere },
    select: { licencePlate: true, provider: true, serviceLine: true, amountCad: true },
  });

  const historicalServiceLines = await prisma.actualSpend.findMany({
    where: {
      AND: [
        activeActualSpendWhere,
        { OR: [{ year: { lt: period.year } }, { year: period.year, month: { lt: period.month } }] },
      ],
    },
    select: { licencePlate: true, provider: true, serviceLine: true },
    distinct: ['licencePlate', 'provider', 'serviceLine'],
  });
  const seenService = new Set(historicalServiceLines.map((l) => `${l.licencePlate}:${l.provider}:${l.serviceLine}`));

  const flags: Array<{
    licencePlate: string;
    provider: Provider;
    serviceLine?: string;
    year: number;
    month: number;
    ruleId: SpendFlagRuleId;
    currentAmountCad: number;
    priorAmountCad?: number;
  }> = [];

  for (const rollup of rollups) {
    const key = `${rollup.licencePlate}:${rollup.provider}`;
    const priorAmount = priorByKey.get(key);
    if (priorAmount !== undefined && priorAmount > 0) {
      const increasePct = ((rollup.amountCad - priorAmount) / priorAmount) * 100;
      if (increasePct > FINANCE_ANOMALY_THRESHOLDS.momIncreasePercent) {
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
    }

    const forecast = forecastByPlateMonth.get(rollup.licencePlate);
    if (forecast !== undefined && forecast > 0) {
      const overPct = ((rollup.amountCad - forecast) / forecast) * 100;
      if (overPct > FINANCE_ANOMALY_THRESHOLDS.overForecastPercent) {
        flags.push({
          licencePlate: rollup.licencePlate,
          provider: rollup.provider,
          year: period.year,
          month: period.month,
          ruleId: SpendFlagRuleId.OVER_FORECAST,
          currentAmountCad: rollup.amountCad,
          priorAmountCad: forecast,
        });
      }
    }
  }

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

  // Replace unreviewed flags for this period so re-ingest is idempotent for open items.
  await prisma.spendFlag.deleteMany({
    where: {
      year: period.year,
      month: period.month,
      reviewedAt: null,
    },
  });

  if (flags.length > 0) {
    await prisma.spendFlag.createMany({ data: flags });
  }

  return flags.length;
}
