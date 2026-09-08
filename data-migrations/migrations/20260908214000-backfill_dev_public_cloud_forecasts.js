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
 * Month classification uses local Date math, same as forecast-grid-utils.
 */
import { ObjectId } from 'mongodb';

const FINANCE_PROVIDERS = ['AWS_LZA', 'AZURE'];
const HORIZON_MONTHS = 24;
const CURRENCY = 'CAD';
const DEFAULT_MONTHLY = { AZURE: 5000, AWS_LZA: 4000 };
const SPARSE_OPTIONAL_AMOUNT = 100;
const LOW_LAST_PAST_AMOUNT = 50;
const INCOMPLETE_TAIL = 3;

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

function shiftMonth(year, month, delta) {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function monthIndex(year, month) {
  return year * 12 + month;
}

function fiscalOrder(month) {
  return month >= 4 ? month : month + 12;
}

function cellKind(year, month, now) {
  const nowIndex = monthIndex(now.getFullYear(), now.getMonth() + 1);
  const cellIndex = monthIndex(year, month);
  if (cellIndex < nowIndex) return 'past';
  if (cellIndex > nowIndex + HORIZON_MONTHS - 1) return 'optional';
  return 'required';
}

function fiscalGrid(now) {
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  const fyStartYear = nowMonth >= 4 ? nowYear : nowYear - 1;
  const horizonEnd = shiftMonth(nowYear, nowMonth, HORIZON_MONTHS - 1);
  const horizonFyStart = horizonEnd.month >= 4 ? horizonEnd.year : horizonEnd.year - 1;
  const lastIndex = monthIndex(horizonFyStart + 1, 3);
  const cells = [];
  let cursor = { year: fyStartYear, month: 4 };
  while (monthIndex(cursor.year, cursor.month) <= lastIndex) {
    cells.push(cursor);
    cursor = shiftMonth(cursor.year, cursor.month, 1);
  }
  return cells;
}

function amountForCell(cell, kind, profile, defaultAmount, extras) {
  const key = `${cell.year}-${cell.month}`;
  if (kind === 'required') {
    return extras.zeroRequired.has(key) ? 0 : defaultAmount;
  }
  if (kind === 'optional') {
    return extras.firstOptionalKey === key ? SPARSE_OPTIONAL_AMOUNT : 0;
  }
  if (!extras.onboardFrom || fiscalOrder(cell.month) < extras.onboardFrom) return 0;
  return extras.lowPastKey === key ? LOW_LAST_PAST_AMOUNT : defaultAmount;
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

  const defaultAmount = DEFAULT_MONTHLY[provider] ?? DEFAULT_MONTHLY.AWS_LZA;
  const onboardFrom = PROFILE_START_MONTH[profile];
  const grid = fiscalGrid(now);
  const required = grid.filter((cell) => cellKind(cell.year, cell.month, now) === 'required');
  const tail = required.slice(-INCOMPLETE_TAIL).map((cell) => `${cell.year}-${cell.month}`);
  const firstOptional = grid.find((cell) => cellKind(cell.year, cell.month, now) === 'optional');
  const lastOnboardedPast = [...grid].reverse().find((cell) => {
    if (cellKind(cell.year, cell.month, now) !== 'past' || !onboardFrom) return false;
    return fiscalOrder(cell.month) >= onboardFrom;
  });

  const extras = {
    onboardFrom,
    zeroRequired: new Set(profile === 'incomplete-required' ? tail : []),
    firstOptionalKey:
      profile === 'sparse-optional' && firstOptional ? `${firstOptional.year}-${firstOptional.month}` : '',
    lowPastKey:
      profile === 'low-last-past' && lastOnboardedPast ? `${lastOnboardedPast.year}-${lastOnboardedPast.month}` : '',
  };

  const monthlyValues = [];
  for (const cell of grid) {
    const key = `${cell.year}-${cell.month}`;
    if (profile === 'incomplete-gaps' && tail.includes(key)) continue;
    monthlyValues.push({
      year: cell.year,
      month: cell.month,
      amount: amountForCell(cell, cellKind(cell.year, cell.month, now), profile, defaultAmount, extras),
      currency: CURRENCY,
    });
  }
  return monthlyValues;
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
