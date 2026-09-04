import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { getRandomOrganization } from '@/helpers/mock-resources/core';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { DB_DATA } from '@/jest.mock';
import { FinanceIngestionStatus, ProjectStatus, Provider } from '@/prisma/client';
import { mockSessionByRole } from '@/services/api-test/core';
import { postFinanceResolveUnmatched } from '@/services/api-test/public-cloud/finance';
import { acquireIngestLock, releaseIngestLock } from '@/services/public-cloud-finance/ingest/ingest-lock';

const MISSING_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const owner = mockNoRoleUsers[0];

async function createResolveFixture() {
  const org = DB_DATA.organizations[0] ?? getRandomOrganization();
  const user = await prisma.user.findFirstOrThrow({ where: { idirGuid: owner.idirGuid } });
  const product = await prisma.publicCloudProduct.create({
    data: {
      licencePlate: `fr${Date.now().toString(36).slice(-6)}`,
      name: 'Finance resolve test',
      description: 'Resolve unmatched route test',
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
      providerSelectionReasonsNote: 'route test',
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
      billingAccountLinks: [],
      members: [],
    },
  });
  const run = await prisma.ingestionRun.create({
    data: {
      provider: Provider.AWS_LZA,
      periodStart: new Date(Date.UTC(2026, 6, 1)),
      periodEnd: new Date(Date.UTC(2026, 6, 31)),
      status: FinanceIngestionStatus.SUCCESS,
      triggeredBy: 'route.test',
    },
  });
  const line = await prisma.unmatchedBillingLine.create({
    data: {
      provider: Provider.AWS_LZA,
      accountIdentifier: '111122223333',
      serviceLine: 'Amazon Elastic Compute Cloud',
      year: 2026,
      month: 7,
      amountCad: 42,
      sourceCurrency: 'CAD',
      ingestionRunId: run.id,
    },
  });
  return { product, line };
}

describe('POST /api/public-cloud/finance/unmatched/:id/resolve', () => {
  it('rejects a path id that is not an ObjectId', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    const res = await postFinanceResolveUnmatched('not-an-id', 'finres1');
    expect(res.status).toBe(400);
  });

  it('returns 400 when the unmatched line does not exist', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    const res = await postFinanceResolveUnmatched(MISSING_ID, 'finres1');
    expect(res.status).toBe(400);
  });

  it('attaches an unmatched line to a matching product', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    const { product, line } = await createResolveFixture();
    const res = await postFinanceResolveUnmatched(line.id, product.licencePlate);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.resolvedTo).toBe(product.licencePlate);
    const spend = await prisma.actualSpend.findFirst({
      where: { licencePlate: product.licencePlate, ingestionRunId: line.ingestionRunId },
    });
    expect(spend?.amountCad).toBe(42);
  });

  it('finishes attach when the line is already claimed for the same product', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    const { product, line } = await createResolveFixture();
    await prisma.unmatchedBillingLine.update({
      where: { id: line.id },
      data: { resolvedTo: product.licencePlate, resolvedAt: new Date() },
    });
    const res = await postFinanceResolveUnmatched(line.id, product.licencePlate);
    expect(res.status).toBe(200);
    const spend = await prisma.actualSpend.findMany({
      where: { licencePlate: product.licencePlate, ingestionRunId: line.ingestionRunId },
    });
    expect(spend).toHaveLength(1);
    expect(spend[0]?.amountCad).toBe(42);
    expect(spend[0]?.unmatchedLineId).toBe(line.id);
  });

  it('attaches two same-service accounts from one run without collapsing amounts', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    const { product, line } = await createResolveFixture();
    const second = await prisma.unmatchedBillingLine.create({
      data: {
        provider: line.provider,
        accountIdentifier: '999988887777',
        serviceLine: line.serviceLine,
        year: line.year,
        month: line.month,
        amountCad: 18,
        sourceCurrency: 'CAD',
        ingestionRunId: line.ingestionRunId,
      },
    });

    const first = await postFinanceResolveUnmatched(line.id, product.licencePlate);
    const next = await postFinanceResolveUnmatched(second.id, product.licencePlate);
    expect(first.status).toBe(200);
    expect(next.status).toBe(200);

    const spend = await prisma.actualSpend.findMany({
      where: { licencePlate: product.licencePlate, ingestionRunId: line.ingestionRunId },
      orderBy: { amountCad: 'desc' },
    });
    expect(spend).toHaveLength(2);
    expect(spend.map((row) => row.amountCad)).toEqual([42, 18]);

    const rollup = await prisma.monthlyProductSpendRollup.findFirst({
      where: { licencePlate: product.licencePlate, year: line.year, month: line.month },
    });
    expect(rollup?.amountCad).toBe(60);
  });

  it('seeds native account identifiers before appending a resolved link', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    const { product, line } = await createResolveFixture();
    await prisma.publicCloudProduct.update({
      where: { licencePlate: product.licencePlate },
      data: {
        awsAccounts: [
          { environment: 'development', name: 'dev', accountId: '222233334444' },
          { environment: 'production', name: 'prod', accountId: '444455556666' },
        ],
      },
    });

    const res = await postFinanceResolveUnmatched(line.id, product.licencePlate);
    expect(res.status).toBe(200);

    const updated = await prisma.publicCloudProduct.findUniqueOrThrow({
      where: { licencePlate: product.licencePlate },
      select: { billingAccountLinks: true },
    });
    const links = updated.billingAccountLinks as Array<{ accountIdentifier: string }>;
    expect(links.map((link) => link.accountIdentifier).sort()).toEqual([
      '111122223333',
      '222233334444',
      '444455556666',
    ]);
  });

  it('returns 409 when ingest already holds the period lock', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    const { product, line } = await createResolveFixture();
    const lock = await acquireIngestLock(line.provider, { year: line.year, month: line.month });
    try {
      const res = await postFinanceResolveUnmatched(line.id, product.licencePlate);
      expect(res.status).toBe(409);
      const current = await prisma.unmatchedBillingLine.findUniqueOrThrow({ where: { id: line.id } });
      expect(current.resolvedTo).toBeNull();
    } finally {
      await releaseIngestLock(lock.id);
    }
  });
});
