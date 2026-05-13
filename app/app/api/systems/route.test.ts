import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { getRandomUser } from '@/helpers/mock-resources/core';
import { findMockUserbyRole, upsertMockUser } from '@/helpers/mock-users';
import { Cluster, ProjectStatus, Provider, SystemStatus } from '@/prisma/client';
import { createRoute, mockSessionByIdirGuid, mockSessionByRole } from '@/services/api-test/core';
import { GET as privateAttachmentsRoute } from '../private-cloud/products/[licencePlate]/attachments/route';
import { POST as attachPrivateProductRoute } from './[id]/private-cloud-products/route';
import { POST as attachPublicProductRoute } from './[id]/public-cloud-products/route';
import { GET as getSystemRoute } from './[id]/route';
import { POST as attachTeamRoute } from './[id]/teams/route';
import { GET as listSystemsRoute, POST as createSystemRoute } from './route';

const route = createRoute('/systems');
const privateAttachmentRoute = createRoute('/private-cloud/products');

function getRandomAppUserWithRoles() {
  return { ...getRandomUser(), roles: [] };
}

describe('Systems API', () => {
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

  it('allows authenticated users to list systems and admins to create one', async () => {
    const org = await prisma.organization.create({
      data: { code: 'SYS', name: 'Systems Org' },
    });

    await mockSessionByRole(GlobalRole.Admin);
    const createResponse = await route.post(createSystemRoute, '/', {
      name: 'Payments',
      code: 'PAYMENTS',
      description: 'System description',
      status: SystemStatus.ACTIVE,
      organizationId: org.id,
      metadata: { tier: 'gold' },
      rules: {},
      policies: {},
      mappings: {},
    });

    expect(createResponse.status).toBe(200);

    await mockSessionByRole(GlobalRole.User);
    const listResponse = await route.get(listSystemsRoute, '/');
    expect(listResponse.status).toBe(200);

    const systems = await listResponse.json();
    expect(systems).toHaveLength(1);
    expect(systems[0].name).toBe('Payments');
  });

  it('supports linking a team and products, and exposes product attachment aggregation', async () => {
    const admin = findMockUserbyRole(GlobalRole.Admin);
    expect(admin).toBeDefined();
    const owner = await upsertMockUser(admin!);
    const secondary = await upsertMockUser(getRandomAppUserWithRoles());
    const expenseAuthority = await upsertMockUser(getRandomAppUserWithRoles());
    const organization = await prisma.organization.create({
      data: { code: 'LNK', name: 'Link Org' },
    });

    const system = await prisma.system.create({
      data: {
        name: 'Case Management',
        code: 'CASEMGMT',
        status: SystemStatus.ACTIVE,
        organizationId: organization.id,
      },
    });

    const team = await prisma.team.create({
      data: {
        name: 'Platform Team',
        code: 'PLATFORM',
        members: [{ userId: owner.id, roles: ['owner'] }],
      },
    });

    const privateProduct = await prisma.privateCloudProduct.create({
      data: {
        licencePlate: 'abcd12',
        name: 'Private Product',
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
        licencePlate: 'efgh34',
        name: 'Public Product',
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

    expect(
      await route.post(attachTeamRoute, '/{{id}}/teams', { teamId: team.id }, { pathParams: { id: system.id } }),
    ).toHaveProperty('status', 200);

    expect(
      await route.post(
        attachPrivateProductRoute,
        '/{{id}}/private-cloud-products',
        { privateCloudProductId: privateProduct.id },
        { pathParams: { id: system.id } },
      ),
    ).toHaveProperty('status', 200);

    expect(
      await route.post(
        attachPublicProductRoute,
        '/{{id}}/public-cloud-products',
        { publicCloudProductId: publicProduct.id },
        { pathParams: { id: system.id } },
      ),
    ).toHaveProperty('status', 200);

    const systemResponse = await route.get(getSystemRoute, '/{{id}}', { pathParams: { id: system.id } });
    const systemDetail = await systemResponse.json();
    expect(systemDetail.teamLinks).toHaveLength(1);
    expect(systemDetail.privateCloudProductLinks).toHaveLength(1);
    expect(systemDetail.publicCloudProductLinks).toHaveLength(1);

    const attachmentsResponse = await privateAttachmentRoute.get(
      privateAttachmentsRoute,
      '/{{licencePlate}}/attachments',
      { pathParams: { licencePlate: privateProduct.licencePlate } },
    );

    expect(attachmentsResponse.status).toBe(200);
    const attachments = await attachmentsResponse.json();
    expect(attachments.systems[0].id).toBe(system.id);
    expect(attachments.teams[0].id).toBe(team.id);
  });

  it('does not allow unauthenticated creation', async () => {
    await mockSessionByIdirGuid();
    const response = await route.post(createSystemRoute, '/', {
      name: 'Blocked',
      code: 'BLOCKED',
      status: SystemStatus.ACTIVE,
    });
    expect(response.status).toBe(401);
  });
});
