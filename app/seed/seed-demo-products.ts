import { defaultAccountCoding } from '../constants/public-cloud';
import prisma from '../core/prisma';
import { ProjectStatus, Provider, PublicCloudProductMemberRole } from '../prisma/client';

export type DemoProductConfig = {
  licencePlate: string;
  name: string;
  provider: Provider;
  description: string;
  budget: { dev: number; test: number; prod: number; tools: number };
};

function monthlyBudgetTotal(budget: DemoProductConfig['budget']) {
  return budget.dev + budget.test + budget.prod + budget.tools;
}

function generatedDemoProducts({
  prefix,
  count,
  startIndex,
  provider,
  providerLabel,
  baseBudget,
}: {
  prefix: string;
  count: number;
  startIndex: number;
  provider: typeof Provider.AZURE | typeof Provider.AWS_LZA;
  providerLabel: string;
  baseBudget: DemoProductConfig['budget'];
}): DemoProductConfig[] {
  return Array.from({ length: count }, (_, offset) => {
    const index = startIndex + offset;
    const budgetStep = (index % 8) + 1;

    return {
      licencePlate: `${prefix}${String(index).padStart(4, '0')}`,
      name: `Cost Model Scale Test ${index} (${providerLabel})`,
      provider,
      description: `Generated local seed ${providerLabel} product for large forecast rollup testing.`,
      budget: {
        dev: baseBudget.dev + budgetStep * 100,
        test: baseBudget.test + budgetStep * 100,
        prod: baseBudget.prod + budgetStep * 250,
        tools: baseBudget.tools + budgetStep * 50,
      },
    };
  });
}

const BASE_AZURE_PRODUCTS: DemoProductConfig[] = [
  {
    licencePlate: 'e71b0e',
    name: 'Cost Model Test 1',
    provider: Provider.AZURE,
    description: 'Local seed Azure product for accountability and cost testing.',
    budget: { dev: 12000, test: 10000, prod: 20000, tools: 5000 },
  },
  {
    licencePlate: 'a1c2d3',
    name: 'Cost Model Test 3 (Azure)',
    provider: Provider.AZURE,
    description: 'Second local seed Azure product to exercise multi-project forecast rollups.',
    budget: { dev: 5000, test: 4000, prod: 8000, tools: 2000 },
  },
];

const BASE_AWS_PRODUCTS: DemoProductConfig[] = [
  {
    licencePlate: 'f82c1a',
    name: 'Cost Model Test 2 (AWS LZA)',
    provider: Provider.AWS_LZA,
    description: 'Local seed AWS LZA product for accountability and cost testing (forecasted in CAD).',
    budget: { dev: 8000, test: 6000, prod: 15000, tools: 3000 },
  },
  {
    licencePlate: 'b4e5f6',
    name: 'Cost Model Test 4 (AWS LZA)',
    provider: Provider.AWS_LZA,
    description: 'Second local seed AWS LZA product to exercise multi-project forecast rollups.',
    budget: { dev: 6000, test: 5000, prod: 10000, tools: 2000 },
  },
];

export const DEMO_AZURE_PRODUCTS: DemoProductConfig[] = [
  ...BASE_AZURE_PRODUCTS,
  ...generatedDemoProducts({
    prefix: 'aa',
    count: 53,
    startIndex: 1,
    provider: Provider.AZURE,
    providerLabel: 'Azure',
    baseBudget: { dev: 2500, test: 2000, prod: 5000, tools: 1000 },
  }),
];

export const DEMO_AWS_PRODUCTS: DemoProductConfig[] = [
  ...BASE_AWS_PRODUCTS,
  ...generatedDemoProducts({
    prefix: 'bb',
    count: 53,
    startIndex: 1,
    provider: Provider.AWS_LZA,
    providerLabel: 'AWS LZA',
    baseBudget: { dev: 2000, test: 1800, prod: 4500, tools: 900 },
  }),
];

export const DEMO_PRODUCTS = [...DEMO_AZURE_PRODUCTS, ...DEMO_AWS_PRODUCTS];
export const AZURE_DEMO_PLATES = DEMO_AZURE_PRODUCTS.map((p) => p.licencePlate);
export const AWS_DEMO_PLATES = DEMO_AWS_PRODUCTS.map((p) => p.licencePlate);

/** @deprecated Use AZURE_DEMO_PLATES[0] */
export const AZURE_DEMO_PLATE = DEMO_AZURE_PRODUCTS[0].licencePlate;
/** @deprecated Use AWS_DEMO_PLATES[0] */
export const AWS_DEMO_PLATE = DEMO_AWS_PRODUCTS[0].licencePlate;

export function expectedMonthlyForecastRollup(provider: typeof Provider.AZURE | typeof Provider.AWS_LZA) {
  const products = provider === Provider.AZURE ? DEMO_AZURE_PRODUCTS : DEMO_AWS_PRODUCTS;
  return products.reduce((sum, product) => sum + monthlyBudgetTotal(product.budget), 0);
}

async function requireUser(email: string) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    throw new Error(`User ${email} not found. Run seed foundation first.`);
  }
  return user;
}

async function seedDemoPublicCloudProduct(config: DemoProductConfig) {
  const existing = await prisma.publicCloudProduct.findFirst({
    where: { licencePlate: config.licencePlate },
  });

  if (existing) {
    if (
      existing.provider !== config.provider ||
      existing.name !== config.name ||
      existing.description !== config.description
    ) {
      const updated = await prisma.publicCloudProduct.update({
        where: { id: existing.id },
        data: {
          provider: config.provider,
          name: config.name,
          description: config.description,
          providerSelectionReasonsNote: `Local development seed product (${config.provider}).`,
        },
      });
      console.log(
        `  updated ${config.provider} product ${config.licencePlate} (${updated.name}) — provider/name synced`,
      );
      return updated;
    }

    console.log(`  ${config.provider} product ${config.licencePlate} (${existing.name}) already exists — skipped`);
    return existing;
  }

  const org = await prisma.organization.findFirst({ orderBy: { code: 'asc' } });
  if (!org) {
    throw new Error('No organization found. Run seed foundation first.');
  }

  const projectOwner = await requireUser('john.doe@gov.bc.ca');
  const primaryTechnicalLead = await requireUser('james.smith@gov.bc.ca');
  const secondaryTechnicalLead = await requireUser('sarah.williams@gov.bc.ca');
  const expenseAuthority = await requireUser('david.johnson@gov.bc.ca');
  const billingReviewer =
    (await prisma.user.findFirst({ where: { email: 'billing.reviewer.system@gov.bc.ca' } })) ?? expenseAuthority;

  const environmentsEnabled = {
    production: true,
    productionRequiresNetworking: false,
    test: true,
    testRequiresNetworking: false,
    development: true,
    developmentRequiresNetworking: false,
    tools: true,
    toolsRequiresNetworking: false,
  };

  const product = await prisma.publicCloudProduct.create({
    data: {
      licencePlate: config.licencePlate,
      name: config.name,
      description: config.description,
      status: ProjectStatus.ACTIVE,
      budget: config.budget,
      projectOwnerId: projectOwner.id,
      primaryTechnicalLeadId: primaryTechnicalLead.id,
      secondaryTechnicalLeadId: secondaryTechnicalLead.id,
      expenseAuthorityId: expenseAuthority.id,
      organizationId: org.id,
      provider: config.provider,
      requiresNetworking: false,
      networkingReason: '',
      providerSelectionReasons: ['Cost Efficiency'],
      providerSelectionReasonsNote: `Local development seed product (${config.provider}).`,
      environmentsEnabled,
      members: [
        { userId: projectOwner.id, roles: [PublicCloudProductMemberRole.EDITOR] },
        { userId: primaryTechnicalLead.id, roles: [PublicCloudProductMemberRole.EDITOR] },
        { userId: secondaryTechnicalLead.id, roles: [PublicCloudProductMemberRole.VIEWER] },
      ],
    },
  });

  const existingBilling = await prisma.publicCloudBilling.findFirst({
    where: { licencePlate: config.licencePlate },
  });

  if (!existingBilling) {
    await prisma.publicCloudBilling.create({
      data: {
        licencePlate: config.licencePlate,
        expenseAuthorityId: expenseAuthority.id,
        accountCoding: defaultAccountCoding,
        signed: true,
        signedAt: new Date(),
        signedById: expenseAuthority.id,
        approved: true,
        approvedAt: new Date(),
        approvedById: billingReviewer.id,
      },
    });
  }

  console.log(
    `  created ${config.provider} product ${config.licencePlate} — ${config.name} (${monthlyBudgetTotal(
      config.budget,
    ).toLocaleString()}/mo)`,
  );
  return product;
}

export async function seedDemoPublicCloudProducts() {
  for (const config of DEMO_PRODUCTS) {
    await seedDemoPublicCloudProduct(config);
  }

  const azureRollup = expectedMonthlyForecastRollup(Provider.AZURE);
  const awsRollup = expectedMonthlyForecastRollup(Provider.AWS_LZA);
  console.log(
    `  expected monthly forecast rollups: Azure CA$${azureRollup.toLocaleString()}, AWS LZA $${awsRollup.toLocaleString()}`,
  );
}

/** @deprecated Use seedDemoPublicCloudProducts */
export async function seedAzurePublicCloudProduct() {
  return seedDemoPublicCloudProduct(DEMO_AZURE_PRODUCTS[0]);
}

/** @deprecated Use seedDemoPublicCloudProducts */
export async function seedAwsPublicCloudProduct() {
  return seedDemoPublicCloudProduct(DEMO_AWS_PRODUCTS[0]);
}
