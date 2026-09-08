import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { getRandomOrganization } from '@/helpers/mock-resources/core';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { DB_DATA } from '@/jest.mock';
import { ProjectStatus, Provider } from '@/prisma/client';
import { mockSessionByIdirGuid, mockSessionByRole } from '@/services/api-test/core';
import { getProductFinance } from '@/services/api-test/public-cloud/finance';

const owner = mockNoRoleUsers[0];

async function createOwnedProduct() {
  const org = DB_DATA.organizations[0] ?? getRandomOrganization();
  const user = await prisma.user.findFirstOrThrow({ where: { idirGuid: owner.idirGuid } });
  return prisma.publicCloudProduct.create({
    data: {
      licencePlate: `fa${Date.now().toString(36).slice(-6)}`,
      name: 'Product finance auth test',
      description: 'actuals permission',
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
      providerSelectionReasonsNote: 'auth test',
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
}

describe('GET /api/public-cloud/products/:licencePlate/finance', () => {
  it('allows the product owner to read actuals', async () => {
    const product = await createOwnedProduct();
    await mockSessionByIdirGuid(owner.idirGuid);
    const res = await getProductFinance(product.licencePlate);
    expect(res.status).toBe(200);
  });

  it('allows Admin to read actuals', async () => {
    const product = await createOwnedProduct();
    await mockSessionByRole(GlobalRole.Admin);
    const res = await getProductFinance(product.licencePlate);
    expect(res.status).toBe(200);
  });

  it('rejects a platform reader who is not on the product', async () => {
    const product = await createOwnedProduct();
    await mockSessionByRole(GlobalRole.Reader);
    const res = await getProductFinance(product.licencePlate);
    expect(res.status).toBe(401);
  });

  it('rejects a billing reader who is not on the product', async () => {
    const product = await createOwnedProduct();
    await mockSessionByRole(GlobalRole.Billingreader);
    const res = await getProductFinance(product.licencePlate);
    expect(res.status).toBe(401);
  });
});
