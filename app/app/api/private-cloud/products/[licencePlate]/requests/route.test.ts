import { expect } from '@jest/globals';
import { Ministry, Cluster, DecisionStatus, RequestType } from '@prisma/client';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers, findMockUserByIdr, findOtherMockUsers, upsertMockUser } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPrivateCloudProject } from '@/services/api-test/private-cloud';
import { createPrivateCloudProject, listPrivateCloudProductRequests } from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';

const [PO, TL1, TL2, EA, RANDOM1] = mockNoRoleUsers;

const memberData = {
  projectOwner: PO,
  primaryTechnicalLead: TL1,
  secondaryTechnicalLead: TL2,
  expenseAuthority: EA,
  randomPerson: RANDOM1,
};

let licencePlate = '';

// Create users in advance before running tests
beforeAll(async () => {
  await Promise.all([PO, TL1, TL2, EA, RANDOM1].map((user) => upsertMockUser(user)));

  const [createdPO, createdTL1, createdTL2, createdEA, createdRANDOM1] = await Promise.all([
    prisma.user.findUnique({ where: { email: PO.email } }),
    prisma.user.findUnique({ where: { email: TL1.email } }),
    prisma.user.findUnique({ where: { email: TL2.email } }),
    prisma.user.findUnique({ where: { email: EA.email } }),
    prisma.user.findUnique({ where: { email: RANDOM1.email } }),
  ]);

  memberData.projectOwner.id = createdPO!.id;
  memberData.primaryTechnicalLead.id = createdTL1!.id;
  memberData.secondaryTechnicalLead.id = createdTL2!.id;
  memberData.expenseAuthority.id = createdEA!.id;
  memberData.randomPerson.id = createdRANDOM1!.id;
});

// TODO: add tests for ministry roles
describe('List Private Cloud Product Requests - Permissions', () => {
  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByEmail(PO.email);

    const requestData = createSamplePrivateCloudProductData({
      data: { ...memberData, ministry: Ministry.PSA, cluster: Cluster.SILVER },
    });
    const res1 = await createPrivateCloudProject(requestData);
    const dat1 = await res1.json();
    licencePlate = dat1.licencePlate;

    expect(res1.status).toBe(200);

    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const res2 = await makePrivateCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      type: RequestType.CREATE,
      decision: DecisionStatus.APPROVED,
    });
    expect(res2.status).toBe(200);

    const res3 = await provisionPrivateCloudProject(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully list 1 request by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await listPrivateCloudProductRequests(licencePlate, false);
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.length).toBe(1);
  });

  it('should successfully list 1 request by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await listPrivateCloudProductRequests(licencePlate, false);
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.length).toBe(1);
  });

  it('should successfully list 1 request by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await listPrivateCloudProductRequests(licencePlate, false);
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.length).toBe(1);
  });

  it('should successfully list 0 request by a random user', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const res1 = await listPrivateCloudProductRequests(licencePlate, false);
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.length).toBe(0);
  });
});
