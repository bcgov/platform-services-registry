import { productExistedDuringMonth } from '@/components/public-cloud/finance/finance-measure-utils';
import prisma from '@/core/prisma';
import { PublicCloudRequestType } from '@/prisma/client';

export function resolveBillingStartedAt(createdAt: Date, provisionedDate: Date | null | undefined) {
  return provisionedDate ?? createdAt;
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

  const [products, createRequests] = await Promise.all([
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
  ]);

  const provisionedByPlate = new Map<string, Date>();
  for (const request of createRequests) {
    if (!request.provisionedDate || provisionedByPlate.has(request.licencePlate)) continue;
    provisionedByPlate.set(request.licencePlate, request.provisionedDate);
  }

  return new Map(
    products.map((product) => [
      product.licencePlate,
      resolveBillingStartedAt(product.createdAt, provisionedByPlate.get(product.licencePlate)),
    ]),
  );
}
