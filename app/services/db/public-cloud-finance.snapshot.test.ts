import {
  currentCalendarMonth,
  currentFiscalYearBounds,
  currentMonthElapsedFraction,
  fiscalYearMonths,
  monthsThrough,
} from '@/components/public-cloud/finance/finance-measure-utils';
import prisma from '@/core/prisma';
import { getRandomOrganization } from '@/helpers/mock-resources/core';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { DB_DATA } from '@/jest.mock';
import { ProjectStatus, Provider } from '@/prisma/client';
import { getFinanceSnapshot } from './public-cloud-finance';

const owner = mockNoRoleUsers[0];

async function createSnapshotProduct(createdAt: Date) {
  const org = DB_DATA.organizations[0] ?? getRandomOrganization();
  const user = await prisma.user.findFirstOrThrow({ where: { idirGuid: owner.idirGuid } });
  return prisma.publicCloudProduct.create({
    data: {
      licencePlate: `fs${Date.now().toString(36).slice(-6)}`,
      name: 'Finance snapshot billing-start test',
      description: 'FYTD forecast scope',
      status: ProjectStatus.ACTIVE,
      budget: { dev: 0, test: 0, prod: 0, tools: 0 },
      projectOwnerId: user.id,
      primaryTechnicalLeadId: user.id,
      expenseAuthorityId: user.id,
      organizationId: org.id,
      provider: Provider.AWS_LZA,
      requiresNetworking: false,
      networkingReason: '',
      providerSelectionReasons: ['Cost Efficiency'],
      providerSelectionReasonsNote: 'snapshot test',
      environmentsEnabled: {
        production: true,
        productionRequiresNetworking: false,
        test: false,
        testRequiresNetworking: false,
        development: false,
        developmentRequiresNetworking: false,
        tools: false,
        toolsRequiresNetworking: false,
      },
      createdAt,
      billingAccountLinks: [],
      members: [],
    },
  });
}

describe('getFinanceSnapshot billing-start scope', () => {
  it('does not count pre-provision forecast months in FYTD or the monthly chart', async () => {
    const fy = currentFiscalYearBounds();
    const through = currentCalendarMonth();
    const ytdMonths = monthsThrough(fiscalYearMonths(fy.startYear), through);
    const startedAt = new Date(Date.UTC(through.year, through.month - 1, 1));
    const product = await createSnapshotProduct(startedAt);

    await prisma.cloudCostForecast.create({
      data: {
        licencePlate: product.licencePlate,
        horizonMonths: 24,
        monthlyValues: ytdMonths.map((month) => ({
          year: month.year,
          month: month.month,
          amount: 100,
          currency: 'CAD',
        })),
      },
    });
    await prisma.monthlyProductSpendRollup.create({
      data: {
        licencePlate: product.licencePlate,
        provider: Provider.AWS_LZA,
        year: through.year,
        month: through.month,
        amountCad: 40,
      },
    });

    const snapshot = await getFinanceSnapshot('AWS_LZA');
    expect(snapshot.fytdActual).toBe(40);
    expect(snapshot.fytdForecast).toBeCloseTo(100 * currentMonthElapsedFraction());

    const currentRow = snapshot.monthlyChart.find((row) => row.year === through.year && row.month === through.month);
    expect(currentRow?.forecast).toBe(100);

    const priorClosed = snapshot.monthlyChart.find(
      (row) => !row.isCurrentPartial && row.year === fy.startYear && row.month === 4 && through.month !== 4,
    );
    if (priorClosed) {
      expect(priorClosed.forecast).toBe(0);
    }
  });
});
