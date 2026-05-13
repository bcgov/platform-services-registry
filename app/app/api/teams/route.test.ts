import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { getRandomUser } from '@/helpers/mock-resources/core';
import { upsertMockUser } from '@/helpers/mock-users';
import { Cluster, ProjectStatus, Provider, SystemStatus } from '@/prisma/client';
import { createRoute, mockSessionByRole } from '@/services/api-test/core';
import { PUT as updateMembersRoute } from './[id]/members/route';
import { POST as attachPrivateProductRoute } from './[id]/private-cloud-products/route';
import { POST as attachPublicProductRoute } from './[id]/public-cloud-products/route';
import { GET as getTeamRoute } from './[id]/route';
import { POST as attachSystemRoute } from './[id]/systems/route';
import { GET as listTeamsRoute, POST as createTeamRoute } from './route';

const route = createRoute('/teams');

function getRandomAppUserWithRoles() {
  return { ...getRandomUser(), roles: [] };
}

describe('Teams API', () => {
  beforeEach(async () => {
    await prisma.systemTeamLink.deleteMany();
    await prisma.systemPrivateCloudProductLink.deleteMany();
    await prisma.systemPublicCloudProductLink.deleteMany();
    await prisma.teamPrivateCloudProductLink.deleteMany();
    await prisma.teamPublicCloudProductLink.deleteMany();
    await prisma.team.deleteMany();
    await prisma.system.deleteMany();
    await prisma.privateCloudProduct.deleteMany();
    await prisma.publicCloudProduct.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
  });

  it('supports create, member updates, and outbound attachments', async () => {
    const owner = await upsertMockUser(getRandomAppUserWithRoles());
    const secondary = await upsertMockUser(getRandomAppUserWithRoles());
    const expenseAuthority = await upsertMockUser(getRandomAppUserWithRoles());
    const organization = await prisma.organization.create({
      data: { code: 'TM', name: 'Team Org' },
    });

    const system = await prisma.system.create({
      data: {
        name: 'Justice Services',
        code: 'JUSTICE',
        status: SystemStatus.ACTIVE,
        organizationId: organization.id,
      },
    });

    const privateProduct = await prisma.privateCloudProduct.create({
      data: {
        licencePlate: 'ijkl56',
        name: 'Private Team Product',
        description: 'Private product',
        status: ProjectStatus.ACTIVE,
        projectOwnerId: owner.id,
        primaryTechnicalLeadId: owner.id,
        secondaryTechnicalLeadId: secondary.id,
        organizationId: organization.id,
        cluster: Cluster.SILVER,
        resourceRequests: {
          development: { cpu: 1, memory: 1, storage: 1 },
          test: { cpu: 1, memory: 1, storage: 1 },
          production: { cpu: 1, memory: 1, storage: 1 },
          tools: { cpu: 1, memory: 1, storage: 1 },
        },
        members: [],
      },
    });

    const publicProduct = await prisma.publicCloudProduct.create({
      data: {
        licencePlate: 'mnop78',
        name: 'Public Team Product',
        description: 'Public product',
        status: ProjectStatus.ACTIVE,
        budget: { dev: 100, test: 100, prod: 100, tools: 100 },
        projectOwnerId: owner.id,
        primaryTechnicalLeadId: owner.id,
        secondaryTechnicalLeadId: secondary.id,
        expenseAuthorityId: expenseAuthority.id,
        organizationId: organization.id,
        provider: Provider.AWS,
        providerSelectionReasons: ['security'],
        providerSelectionReasonsNote: 'Needed',
        environmentsEnabled: { development: true, test: true, production: true, tools: false },
        members: [],
      },
    });

    await mockSessionByRole(GlobalRole.Admin);

    const createResponse = await route.post(createTeamRoute, '/', {
      name: 'Payments Team',
      code: 'PAYTEAM',
      description: 'Team description',
      metadata: {},
      rules: {},
      policies: {},
      mappings: {},
      members: [],
    });
    expect(createResponse.status).toBe(200);
    const created = await createResponse.json();

    await route.put(
      updateMembersRoute,
      '/{{id}}/members',
      { members: [{ userId: owner.id, roles: ['owner', 'editor'] }] },
      { pathParams: { id: created.id } },
    );

    await route.post(attachSystemRoute, '/{{id}}/systems', { systemId: system.id }, { pathParams: { id: created.id } });
    await route.post(
      attachPrivateProductRoute,
      '/{{id}}/private-cloud-products',
      { privateCloudProductId: privateProduct.id },
      { pathParams: { id: created.id } },
    );
    await route.post(
      attachPublicProductRoute,
      '/{{id}}/public-cloud-products',
      { publicCloudProductId: publicProduct.id },
      { pathParams: { id: created.id } },
    );

    const detailResponse = await route.get(getTeamRoute, '/{{id}}', { pathParams: { id: created.id } });
    const detail = await detailResponse.json();
    expect(detail.members).toHaveLength(1);
    expect(detail.systemLinks).toHaveLength(1);
    expect(detail.privateCloudProductLinks).toHaveLength(1);
    expect(detail.publicCloudProductLinks).toHaveLength(1);

    const listResponse = await route.get(listTeamsRoute, '/');
    expect(listResponse.status).toBe(200);
    const list = await listResponse.json();
    expect(list[0].name).toBe('Payments Team');
  });
});
