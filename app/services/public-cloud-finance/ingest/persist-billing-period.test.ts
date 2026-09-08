import prisma from '@/core/prisma';
import { getRandomOrganization } from '@/helpers/mock-resources/core';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { DB_DATA } from '@/jest.mock';
import { FinanceIngestionStatus, ProjectStatus, Provider } from '@/prisma/client';
import { persistBillingPeriod } from './persist-billing-period';

jest.mock('@/services/public-cloud-finance/monthly-fx-rate', () => ({
  ensureMonthlyUsdCadRate: jest.fn().mockResolvedValue({
    rate: 1.35,
    rateDate: new Date('2026-07-31T00:00:00.000Z'),
  }),
}));

jest.mock('./evaluate-flags', () => ({
  evaluateSpendFlagsForPeriod: jest.fn().mockResolvedValue(0),
}));

const owner = mockNoRoleUsers[0];
const period = { year: 2026, month: 7 };
let productSeq = 0;

function nextAccount(prefix: string) {
  productSeq += 1;
  return `${prefix}${String(productSeq).padStart(4, '0')}${String(Date.now()).slice(-4)}`;
}

async function createLinkedProduct(accountIdentifier: string) {
  const org = DB_DATA.organizations[0] ?? getRandomOrganization();
  const user = await prisma.user.findFirstOrThrow({ where: { idirGuid: owner.idirGuid } });
  return prisma.publicCloudProduct.create({
    data: {
      licencePlate: `fp${String(productSeq).padStart(2, '0')}${Date.now().toString(36).slice(-4)}`,
      name: 'Persist billing period test',
      description: 'persist-billing-period integration test',
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
      providerSelectionReasonsNote: 'persist test',
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
      createdAt: new Date(Date.UTC(2025, 3, 1)),
      billingAccountLinks: [{ provider: Provider.AWS_LZA, accountIdentifier }],
      members: [],
    },
  });
}

describe('persistBillingPeriod', () => {
  it('writes spend, a SUCCESS unscoped run, and a rollup', async () => {
    const account = nextAccount('5555');
    const product = await createLinkedProduct(account);
    const result = await persistBillingPeriod({
      provider: Provider.AWS_LZA,
      period,
      triggeredBy: 'persist.test',
      lines: [{ accountIdentifier: account, serviceLine: 'AmazonEC2', amount: 10, currency: 'USD' }],
    });

    expect(result.status).toBe(FinanceIngestionStatus.SUCCESS);
    expect(result.rowsLoaded).toBe(1);
    expect(result.rowsUnmatched).toBe(0);

    const run = await prisma.ingestionRun.findUniqueOrThrow({ where: { id: result.runId } });
    expect(run.isScoped).toBe(false);
    expect(run.status).toBe(FinanceIngestionStatus.SUCCESS);

    const spend = await prisma.actualSpend.findFirst({
      where: { licencePlate: product.licencePlate, ingestionRunId: result.runId, supersededBy: null },
    });
    expect(spend).toEqual(expect.objectContaining({ amountCad: 13.5, serviceLine: 'AmazonEC2' }));

    const rollup = await prisma.monthlyProductSpendRollup.findUnique({
      where: {
        licencePlate_provider_year_month: {
          licencePlate: product.licencePlate,
          provider: Provider.AWS_LZA,
          year: 2026,
          month: 7,
        },
      },
    });
    expect(rollup?.amountCad).toBe(13.5);
  });

  it('supersedes the previous active generation on a second persist', async () => {
    const account = nextAccount('5555');
    const product = await createLinkedProduct(account);
    const first = await persistBillingPeriod({
      provider: Provider.AWS_LZA,
      period,
      triggeredBy: 'persist.test',
      lines: [{ accountIdentifier: account, serviceLine: 'AmazonEC2', amount: 10, currency: 'CAD' }],
    });
    const second = await persistBillingPeriod({
      provider: Provider.AWS_LZA,
      period,
      triggeredBy: 'persist.test',
      lines: [{ accountIdentifier: account, serviceLine: 'AmazonEC2', amount: 22, currency: 'CAD' }],
    });

    const active = await prisma.actualSpend.findMany({
      where: { licencePlate: product.licencePlate, supersededBy: null },
    });
    expect(active).toHaveLength(1);
    expect(active[0]?.amountCad).toBe(22);
    expect(active[0]?.ingestionRunId).toBe(second.runId);

    const superseded = await prisma.actualSpend.findMany({
      where: { licencePlate: product.licencePlate, ingestionRunId: first.runId },
    });
    expect(superseded).toHaveLength(1);
    expect(superseded[0]?.supersededBy).toBeTruthy();
  });

  it('writes unmatched rows for unknown accounts', async () => {
    const result = await persistBillingPeriod({
      provider: Provider.AWS_LZA,
      period,
      triggeredBy: 'persist.test',
      lines: [{ accountIdentifier: nextAccount('9999'), serviceLine: 'AmazonS3', amount: 8, currency: 'CAD' }],
    });

    expect(result.rowsLoaded).toBe(0);
    expect(result.rowsUnmatched).toBe(1);
    const unmatched = await prisma.unmatchedBillingLine.findFirst({
      where: { ingestionRunId: result.runId },
    });
    expect(unmatched?.amountCad).toBe(8);
  });

  it('persists an empty month as SUCCESS with a $0 rollup', async () => {
    const product = await createLinkedProduct(nextAccount('5555'));
    const result = await persistBillingPeriod({
      provider: Provider.AWS_LZA,
      period,
      triggeredBy: 'persist.test',
      lines: [],
    });

    expect(result.status).toBe(FinanceIngestionStatus.SUCCESS);
    expect(result.rowsLoaded).toBe(0);
    const run = await prisma.ingestionRun.findUniqueOrThrow({ where: { id: result.runId } });
    expect(run.isScoped).toBe(false);

    const rollup = await prisma.monthlyProductSpendRollup.findUnique({
      where: {
        licencePlate_provider_year_month: {
          licencePlate: product.licencePlate,
          provider: Provider.AWS_LZA,
          year: 2026,
          month: 7,
        },
      },
    });
    expect(rollup?.amountCad).toBe(0);
  });

  it('rejects classic AWS before creating a run', async () => {
    await expect(
      persistBillingPeriod({
        provider: Provider.AWS,
        period,
        triggeredBy: 'persist.test',
        lines: [{ accountIdentifier: nextAccount('5555'), serviceLine: 'AmazonEC2', amount: 1, currency: 'CAD' }],
      }),
    ).rejects.toThrow(/AWS_LZA/);

    const runs = await prisma.ingestionRun.findMany({ where: { provider: Provider.AWS, triggeredBy: 'persist.test' } });
    expect(runs).toHaveLength(0);
  });
});
