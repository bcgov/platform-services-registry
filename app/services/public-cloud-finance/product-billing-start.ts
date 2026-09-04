import { productExistedDuringMonth } from '@/components/public-cloud/finance/finance-measure-utils';
import prisma from '@/core/prisma';
import { PublicCloudRequestType } from '@/prisma/client';
import { activeActualSpendWhere } from './active-spend';

export function firstOfUtcMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1));
}

/** Earliest of first stored actual and registry start (provisioned, else created). */
export function resolveBillingStartedAt(
  createdAt: Date,
  provisionedDate: Date | null | undefined,
  firstActualAt?: Date | null,
) {
  const registryStart = provisionedDate ?? createdAt;
  if (!firstActualAt || firstActualAt >= registryStart) return registryStart;
  return firstActualAt;
}

export function earliestActualMonthByPlate(rows: Array<{ licencePlate: string; year: number; month: number }>) {
  const earliest = new Map<string, Date>();
  for (const row of rows) {
    const at = firstOfUtcMonth(row.year, row.month);
    const current = earliest.get(row.licencePlate);
    if (!current || at < current) earliest.set(row.licencePlate, at);
  }
  return earliest;
}

export function platesToRollupForPeriod(options: {
  products: Array<{ licencePlate: string; billingStartedAt: Date }>;
  period: { year: number; month: number };
  matchedPlates: string[];
}) {
  const existed = options.products
    .filter((product) => productExistedDuringMonth(product.billingStartedAt, options.period.year, options.period.month))
    .map((product) => product.licencePlate);
  return [...new Set([...existed, ...options.matchedPlates])];
}

export async function loadProductBillingStartByPlate(licencePlates: string[]) {
  const unique = [...new Set(licencePlates)];
  if (unique.length === 0) return new Map<string, Date>();

  const [products, createRequests, actualMonths] = await Promise.all([
    prisma.publicCloudProduct.findMany({
      where: { licencePlate: { in: unique } },
      select: { licencePlate: true, createdAt: true },
    }),
    prisma.publicCloudRequest.findMany({
      where: {
        licencePlate: { in: unique },
        type: PublicCloudRequestType.CREATE,
        provisionedDate: { not: null },
      },
      select: { licencePlate: true, provisionedDate: true },
      orderBy: { provisionedDate: 'asc' },
    }),
    prisma.actualSpend.findMany({
      where: { AND: [activeActualSpendWhere, { licencePlate: { in: unique } }] },
      select: { licencePlate: true, year: true, month: true },
      distinct: ['licencePlate', 'year', 'month'],
    }),
  ]);

  const provisionedByPlate = new Map<string, Date>();
  for (const request of createRequests) {
    if (!request.provisionedDate || provisionedByPlate.has(request.licencePlate)) continue;
    provisionedByPlate.set(request.licencePlate, request.provisionedDate);
  }
  const firstActualByPlate = earliestActualMonthByPlate(actualMonths);

  return new Map(
    products.map((product) => [
      product.licencePlate,
      resolveBillingStartedAt(
        product.createdAt,
        provisionedByPlate.get(product.licencePlate),
        firstActualByPlate.get(product.licencePlate),
      ),
    ]),
  );
}
