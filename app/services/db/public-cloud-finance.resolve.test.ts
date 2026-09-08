import prisma from '@/core/prisma';
import { getRandomOrganization } from '@/helpers/mock-resources/core';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { DB_DATA } from '@/jest.mock';
import { FinanceIngestionStatus, ProjectStatus, Provider } from '@/prisma/client';
import { IngestAlreadyRunningError } from '@/services/public-cloud-finance/ingest/ingest-errors';
import { acquireIngestLock, releaseIngestLock } from '@/services/public-cloud-finance/ingest/ingest-lock';
import { resolveUnmatchedBillingLine } from './public-cloud-finance';

const owner = mockNoRoleUsers[0];

async function createResolveFixture() {
  const org = DB_DATA.organizations[0] ?? getRandomOrganization();
  const user = await prisma.user.findFirstOrThrow({ where: { idirGuid: owner.idirGuid } });
  const product = await prisma.publicCloudProduct.create({
    data: {
      licencePlate: `rl${Date.now().toString(36).slice(-6)}`,
      name: 'Finance resolve lock test',
      description: 'resolve + ingest lock',
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
      providerSelectionReasonsNote: 'resolve lock test',
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
      triggeredBy: 'resolve.lock.test',
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

describe('resolveUnmatchedBillingLine', () => {
  it('refuses to resolve while ingest holds the same provider/month lock', async () => {
    const { product, line } = await createResolveFixture();
    const lock = await acquireIngestLock(line.provider, { year: line.year, month: line.month });
    try {
      await expect(resolveUnmatchedBillingLine(line.id, product.licencePlate)).rejects.toBeInstanceOf(
        IngestAlreadyRunningError,
      );
      const current = await prisma.unmatchedBillingLine.findUniqueOrThrow({ where: { id: line.id } });
      expect(current.resolvedTo).toBeNull();
    } finally {
      await releaseIngestLock(lock.id);
    }
  });

  it('leaves the unmatched line unresolved if spend attach fails', async () => {
    const { product, line } = await createResolveFixture();
    const spy = jest.spyOn(prisma.actualSpend, 'create').mockRejectedValueOnce(new Error('write failed'));
    try {
      await expect(resolveUnmatchedBillingLine(line.id, product.licencePlate)).rejects.toThrow('write failed');
      const current = await prisma.unmatchedBillingLine.findUniqueOrThrow({ where: { id: line.id } });
      expect(current.resolvedTo).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });
});
