import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { getRandomOrganization } from '@/helpers/mock-resources/core';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { DB_DATA } from '@/jest.mock';
import { FinanceIngestionStatus, ProjectStatus, Provider } from '@/prisma/client';
import { mockSessionByRole } from '@/services/api-test/core';
import { postFinanceResolveUnmatched } from '@/services/api-test/public-cloud/finance';

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
  });
});
