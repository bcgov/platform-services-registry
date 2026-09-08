/**
 * Silver dev only. Overwrite CloudCostForecast for every AWS LZA and Azure product
 * so finance / forecast UIs have demo data that matches local seed amounts
 * (CA$5k Azure / CA$4k AWS) and shows every coverage state.
 *
 * Two incomplete styles exist because the screens disagree:
 * - omitted required-month keys → coverage chase list "incomplete"
 * - required months present at $0 → platform "Incomplete required" filter
 *
 * Classic AWS is left alone. Test and prod skip (APP_ENV !== 'dev').
 */
import { ObjectId } from 'mongodb';

const FINANCE_PROVIDERS = ['AWS_LZA', 'AZURE'];
const HORIZON_MONTHS = 24;
const FISCAL_YEAR_START_MONTH = 4;
const FISCAL_YEAR_END_MONTH = 3;
const CURRENCY = 'CAD';
const DEFAULT_MONTHLY_AZURE = 5000;
const DEFAULT_MONTHLY_AWS = 4000;
const SPARSE_OPTIONAL_AMOUNT = 100;
const LOW_LAST_PAST_AMOUNT = 50;
const INCOMPLETE_REQUIRED_COUNT = 3;

const SPECIAL_PROFILES = [
  'missing',
  'incomplete-gaps',
  'incomplete-required',
  'sparse-optional',
  'from-may',
  'from-jun',
  'from-jul',
  'from-aug',
  'complete',
  'low-last-past',
];

const PROFILE_START_MONTH = {
  'with-past': 4,
  'incomplete-required': 4,
  'incomplete-gaps': 4,
  'sparse-optional': 4,
  'low-last-past': 4,
  'from-may': 5,
  'from-jun': 6,
  'from-jul': 7,
  'from-aug': 8,
};

function monthKey(year, month) {
  return `${year}-${month}`;
}

function getFiscalYearStartForMonth(year, month) {
  return month >= FISCAL_YEAR_START_MONTH ? year : year - 1;
}

function getFiscalYearStartYear(now) {
  return getFiscalYearStartForMonth(now.getUTCFullYear(), now.getUTCMonth() + 1);
}

function getRequiredHorizonEndDate(now, horizonMonths = HORIZON_MONTHS) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + horizonMonths - 1, 1));
}

function isPastMonth(year, month, now) {
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;
  return year < currentYear || (year === currentYear && month < currentMonth);
}

function isBeyondRequiredHorizon(year, month, now, horizonMonths = HORIZON_MONTHS) {
  const end = getRequiredHorizonEndDate(now, horizonMonths);
  return year * 12 + month > end.getUTCFullYear() * 12 + (end.getUTCMonth() + 1);
}

function isRequiredForecastMonth(year, month, now, horizonMonths = HORIZON_MONTHS) {
  return !isPastMonth(year, month, now) && !isBeyondRequiredHorizon(year, month, now, horizonMonths);
}

function fiscalMonthOrder(month) {
  return month >= FISCAL_YEAR_START_MONTH ? month : month + 12;
}

function monthlyAmountFor(provider) {
  return provider === 'AZURE' ? DEFAULT_MONTHLY_AZURE : DEFAULT_MONTHLY_AWS;
}

function buildRollingFiscalForecastMonths(monthlyAmount, now, horizonMonths = HORIZON_MONTHS) {
  const fiscalStartYear = getFiscalYearStartYear(now);
  const startDate = new Date(Date.UTC(fiscalStartYear, FISCAL_YEAR_START_MONTH - 1, 1));
  const horizonEnd = getRequiredHorizonEndDate(now, horizonMonths);
  const horizonEndFyStart = getFiscalYearStartForMonth(horizonEnd.getUTCFullYear(), horizonEnd.getUTCMonth() + 1);
  const endDate = new Date(Date.UTC(horizonEndFyStart + 1, FISCAL_YEAR_END_MONTH - 1, 1));
  const monthCount =
    (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
    (endDate.getUTCMonth() - startDate.getUTCMonth()) +
    1;

  const monthlyValues = [];
  for (let i = 0; i < monthCount; i += 1) {
    const date = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + i, 1));
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    monthlyValues.push({
      year,
      month,
      amount: isRequiredForecastMonth(year, month, now, horizonMonths) ? monthlyAmount : 0,
      currency: CURRENCY,
    });
  }
  return monthlyValues;
}

function applyPastFiscalMonths(values, now, fromMonth = FISCAL_YEAR_START_MONTH) {
  const sampleAmount =
    values.find((value) => isRequiredForecastMonth(value.year, value.month, now) && value.amount > 0)?.amount ?? 0;
  if (sampleAmount <= 0) return values;
  const startOrder = fiscalMonthOrder(fromMonth);

  return values.map((value) => {
    if (!isPastMonth(value.year, value.month, now)) return value;
    if (fiscalMonthOrder(value.month) < startOrder) return { ...value, amount: 0 };
    return { ...value, amount: sampleAmount };
  });
}

function lastRequiredKeys(values, now, count = INCOMPLETE_REQUIRED_COUNT) {
  return values
    .filter((value) => isRequiredForecastMonth(value.year, value.month, now))
    .slice(-count)
    .map((value) => monthKey(value.year, value.month));
}

function applyIncompleteRequiredMonths(values, now) {
  const toClear = new Set(lastRequiredKeys(values, now));
  return values.map((value) => (toClear.has(monthKey(value.year, value.month)) ? { ...value, amount: 0 } : value));
}

function applyIncompleteGaps(values, now) {
  const toOmit = new Set(lastRequiredKeys(values, now));
  return values.filter((value) => !toOmit.has(monthKey(value.year, value.month)));
}

function applySparseOptionalMonth(values, amount = SPARSE_OPTIONAL_AMOUNT, now) {
  const firstOptional = values.find((value) => isBeyondRequiredHorizon(value.year, value.month, now));
  if (!firstOptional) return values;
  return values.map((value) =>
    value.year === firstOptional.year && value.month === firstOptional.month ? { ...value, amount } : value,
  );
}

function applyLastPastMonthLowForecast(values, amount = LOW_LAST_PAST_AMOUNT, now) {
  const lastPast = [...values].reverse().find((value) => isPastMonth(value.year, value.month, now) && value.amount > 0);
  if (!lastPast) return values;
  return values.map((value) =>
    value.year === lastPast.year && value.month === lastPast.month ? { ...value, amount } : value,
  );
}

export function assignProfiles(products) {
  const assigned = [];

  for (const provider of FINANCE_PROVIDERS) {
    const group = products
      .filter((product) => product.provider === provider)
      .sort((a, b) => String(a.licencePlate).localeCompare(String(b.licencePlate)));
    const active = group.filter((product) => product.status === 'ACTIVE');
    const inactive = group.filter((product) => product.status !== 'ACTIVE');

    active.forEach((product, index) => {
      assigned.push({
        product,
        profile: index < SPECIAL_PROFILES.length ? SPECIAL_PROFILES[index] : 'with-past',
      });
    });
    for (const product of inactive) {
      assigned.push({ product, profile: 'with-past' });
    }
  }

  return assigned;
}

export function buildMonthlyValues(profile, provider, now) {
  if (profile === 'missing') return null;

  let values = buildRollingFiscalForecastMonths(monthlyAmountFor(provider), now);
  const startMonth = PROFILE_START_MONTH[profile];
  if (startMonth) {
    values = applyPastFiscalMonths(values, now, startMonth);
  }
  if (profile === 'incomplete-required') {
    values = applyIncompleteRequiredMonths(values, now);
  } else if (profile === 'incomplete-gaps') {
    values = applyIncompleteGaps(values, now);
  } else if (profile === 'sparse-optional') {
    values = applySparseOptionalMonth(values, SPARSE_OPTIONAL_AMOUNT, now);
  } else if (profile === 'low-last-past') {
    values = applyLastPastMonthLowForecast(values, LOW_LAST_PAST_AMOUNT, now);
  }
  return values;
}

function emptyProfileCounts() {
  return Object.fromEntries([...SPECIAL_PROFILES, 'with-past'].map((profile) => [profile, 0]));
}

function formatCounts(counts) {
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([profile, count]) => `${profile}=${count}`)
    .join(' ');
}

export const up = async (db) => {
  const appEnv = process.env.APP_ENV;
  if (appEnv !== 'dev') {
    console.log(`backfill_dev_public_cloud_forecasts: not running outside Silver dev (APP_ENV=${appEnv || 'unset'})`);
    return;
  }

  const now = new Date();
  const products = await db
    .collection('PublicCloudProduct')
    .find({ provider: { $in: FINANCE_PROVIDERS } }, { projection: { licencePlate: 1, provider: 1, status: 1 } })
    .toArray();

  if (products.length === 0) {
    console.log('backfill_dev_public_cloud_forecasts: no AWS_LZA / AZURE products.');
    return;
  }

  const forecasts = db.collection('CloudCostForecast');
  const assigned = assignProfiles(products);
  const countsByProvider = {
    AWS_LZA: emptyProfileCounts(),
    AZURE: emptyProfileCounts(),
  };
  let upserted = 0;
  let deleted = 0;

  for (const { product, profile } of assigned) {
    countsByProvider[product.provider][profile] += 1;
    const licencePlate = product.licencePlate;
    const monthlyValues = buildMonthlyValues(profile, product.provider, now);

    if (monthlyValues == null) {
      const result = await forecasts.deleteOne({ licencePlate });
      deleted += result.deletedCount;
      continue;
    }

    const result = await forecasts.updateOne(
      { licencePlate },
      {
        $set: {
          licencePlate,
          horizonMonths: HORIZON_MONTHS,
          monthlyValues,
          updatedAt: now,
        },
        $setOnInsert: {
          _id: new ObjectId(),
          createdAt: now,
        },
      },
      { upsert: true },
    );
    upserted += result.modifiedCount + (result.upsertedCount ?? 0);
  }

  console.log(
    `backfill_dev_public_cloud_forecasts: AWS_LZA ${formatCounts(countsByProvider.AWS_LZA)}; AZURE ${formatCounts(
      countsByProvider.AZURE,
    )}; upserted ${upserted}, deleted ${deleted}.`,
  );
};

export const down = async () => {};
