/**
 * Opt-in live ingest integration tests — local only.
 *
 * Excluded from default `pnpm test` / GitHub Actions via jest `testPathIgnorePatterns`
 * (*.live.test.ts). Run locally when authenticated:
 *
 *   pnpm test:finance-live
 *
 * Requires AWS SSO (`FINANCE_AWS_PROFILE`) and/or `az login` plus:
 *   FINANCE_LIVE_BILLING=api
 *   FINANCE_LIVE_TEST_LICENCE_PLATES=...
 *   FINANCE_LIVE_TEST_ACCOUNT_IDS=...   (Azure subscription IDs and/or AWS account IDs)
 *
 * Hard-skips when CI / GITHUB_ACTIONS is set, even if env vars are present.
 * Does not commit real IDs or spend amounts.
 *
 * Note: jest.setup cleanUp() clears products — this suite upserts the allowlisted plates it needs.
 */
import prisma from '@/core/prisma';
import { Prisma, ProjectStatus, Provider } from '@/prisma/client';
import { inventDemoAzureSubscriptions } from '@/services/azure/subscriptions';
import { inventDemoBillingLinks } from '@/services/public-cloud-finance/billing-account-links';
import { createAwsBillingSource, createAzureBillingSource } from '@/services/public-cloud-finance/ingest/real-sources';
import { ingestBillingPeriod } from '@/services/public-cloud-finance/ingest/run-ingest';

const isCi = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

const plates = (process.env.FINANCE_LIVE_TEST_LICENCE_PLATES || '')
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean);

const accountIds = (process.env.FINANCE_LIVE_TEST_ACCOUNT_IDS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

const liveApi = ['api', 'live', '1', 'true'].includes((process.env.FINANCE_LIVE_BILLING || '').toLowerCase());
const hasAwsProfile = Boolean(process.env.FINANCE_AWS_PROFILE || process.env.AWS_PROFILE);
const hasAzureAccounts = accountIds.some((id) => id.includes('-'));
const hasAwsAccounts = accountIds.some((id) => /^\d{12}$/.test(id));

const canRunAws = !isCi && liveApi && plates.length > 0 && hasAwsProfile;
const canRunAzure = !isCi && liveApi && plates.length > 0 && hasAzureAccounts;

function lastCompletePeriod(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

async function ensureLiveTestProduct(licencePlate: string, provider: Provider) {
  const existing = await prisma.publicCloudProduct.findUnique({ where: { licencePlate } });
  if (existing) {
    return existing;
  }

  const org =
    (await prisma.organization.findFirst({ orderBy: { code: 'asc' } })) ??
    (await prisma.organization.create({
      data: { code: 'LIVE', name: 'Live Test Org', isAgMinistry: false },
    }));

  let user = await prisma.user.findFirst({ orderBy: { email: 'asc' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'live.test@example.com',
        firstName: 'Live',
        lastName: 'Test',
        idirGuid: 'live-test-idir-guid',
      },
    });
  }

  return prisma.publicCloudProduct.create({
    data: {
      licencePlate,
      name: `Live finance test ${licencePlate}`,
      description: 'Temporary product for live billing integration tests.',
      status: ProjectStatus.ACTIVE,
      budget: { dev: 0, test: 0, prod: 0, tools: 0 },
      projectOwnerId: user.id,
      primaryTechnicalLeadId: user.id,
      expenseAuthorityId: user.id,
      organizationId: org.id,
      provider,
      requiresNetworking: false,
      networkingReason: '',
      providerSelectionReasons: ['Cost Efficiency'],
      providerSelectionReasonsNote: 'Live finance integration test product.',
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
      billingAccountLinks: inventDemoBillingLinks(licencePlate, provider),
      members: [],
    },
  });
}

describe('finance live billing sources (SSO / az login)', () => {
  const period = lastCompletePeriod();

  (canRunAws ? it : it.skip)(
    'fetches real AWS Cost Explorer rows for allowlisted accounts and ingests into mapped plates',
    async () => {
      const awsAccountIds = accountIds.filter((id) => /^\d{12}$/.test(id));
      const aws = createAwsBillingSource(Provider.AWS_LZA);
      const rows = await aws.fetchBillingLines(period, {
        licencePlates: plates,
        accountIdentifiers: awsAccountIds.length ? awsAccountIds : undefined,
      });

      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.provider).toBe(Provider.AWS_LZA);
        expect(row.accountIdentifier).toMatch(/^\d{12}$/);
        expect(row.serviceLine.length).toBeGreaterThan(0);
        expect(row.amountCad).toBeGreaterThan(0);
      }

      const plate = plates[0];
      const accountIdentifier = awsAccountIds[0] ?? rows[0].accountIdentifier;
      const product = await ensureLiveTestProduct(plate, Provider.AWS_LZA);
      const previousLinks = product.billingAccountLinks;

      await prisma.publicCloudProduct.update({
        where: { licencePlate: plate },
        data: {
          provider: Provider.AWS_LZA,
          billingAccountLinks: [{ provider: Provider.AWS_LZA, accountIdentifier, environment: 'production' }],
        },
      });

      try {
        const result = await ingestBillingPeriod({
          provider: Provider.AWS_LZA,
          period,
          triggeredBy: 'live.test.ts',
          source: aws,
          scope: { licencePlates: [plate], accountIdentifiers: [accountIdentifier] },
        });
        expect(result.status).toBe('SUCCESS');
        expect(result.rowsLoaded).toBeGreaterThan(0);

        const rollup = await prisma.monthlyProductSpendRollup.findFirst({
          where: { licencePlate: plate, provider: Provider.AWS_LZA, year: period.year, month: period.month },
        });
        expect(rollup?.amountCad ?? 0).toBeGreaterThan(0);
      } finally {
        await prisma.publicCloudProduct.update({
          where: { licencePlate: plate },
          data: {
            billingAccountLinks: previousLinks ?? inventDemoBillingLinks(plate, Provider.AWS_LZA),
          },
        });
      }
    },
    300_000,
  );

  (canRunAzure ? it : it.skip)(
    'fetches real Azure Cost Management rows for allowlisted subscriptions and ingests into mapped plates',
    async () => {
      const azureSubIds = accountIds.filter((id) => id.includes('-'));
      const azure = createAzureBillingSource();
      const rows = await azure.fetchBillingLines(period, {
        licencePlates: plates,
        accountIdentifiers: azureSubIds,
      });

      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.provider).toBe(Provider.AZURE);
        expect(row.accountIdentifier).toBeTruthy();
        expect(row.serviceLine.length).toBeGreaterThan(0);
        expect(typeof row.amountCad).toBe('number');
      }

      const plate = plates.find((p) => p !== plates[0]) ?? plates[0];
      const accountIdentifier = azureSubIds[0];
      const product = await ensureLiveTestProduct(plate, Provider.AZURE);
      const previousLinks = product.billingAccountLinks;
      const previousSubscriptions = product.azureSubscriptions;

      await prisma.publicCloudProduct.update({
        where: { licencePlate: plate },
        data: {
          provider: Provider.AZURE,
          // Prefer native azureSubscriptions (LZA-style) for join; clear links for this run.
          billingAccountLinks: [],
          azureSubscriptions: [
            {
              environment: 'production',
              name: `${plate}-prod`,
              subscriptionId: accountIdentifier,
            },
          ] as unknown as Prisma.InputJsonValue,
        },
      });

      try {
        const result = await ingestBillingPeriod({
          provider: Provider.AZURE,
          period,
          triggeredBy: 'live.test.ts',
          source: azure,
          scope: { licencePlates: [plate], accountIdentifiers: [accountIdentifier] },
        });
        expect(result.status).toBe('SUCCESS');
        expect(result.rowsLoaded).toBeGreaterThan(0);

        const rollup = await prisma.monthlyProductSpendRollup.findFirst({
          where: { licencePlate: plate, provider: Provider.AZURE, year: period.year, month: period.month },
        });
        expect(rollup?.amountCad ?? 0).toBeGreaterThan(0);
      } finally {
        await prisma.publicCloudProduct.update({
          where: { licencePlate: plate },
          data: {
            billingAccountLinks: (previousLinks ??
              inventDemoBillingLinks(plate, Provider.AZURE)) as unknown as Prisma.InputJsonValue,
            azureSubscriptions: (previousSubscriptions ??
              inventDemoAzureSubscriptions(plate)) as unknown as Prisma.InputJsonValue,
          },
        });
      }
    },
    300_000,
  );

  if (!canRunAws && !canRunAzure) {
    it('skips when live billing env is not configured', () => {
      expect(liveApi && plates.length > 0 && (hasAwsProfile || hasAzureAccounts || hasAwsAccounts)).toBe(false);
    });
  }
});
