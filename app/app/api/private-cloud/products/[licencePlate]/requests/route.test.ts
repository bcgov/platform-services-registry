import { expect } from '@jest/globals';
import { $Enums } from '@prisma/client';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers, findMockUserByIdr, findOtherMockUsers } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPrivateCloudProject } from '@/services/api-test/private-cloud';
import { createPrivateCloudProject, listPrivateCloudProductRequests } from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';

const PO = mockNoRoleUsers[0];
const TL1 = mockNoRoleUsers[1];
const TL2 = mockNoRoleUsers[2];
const RANDOM1 = mockNoRoleUsers[3];

const memberData = {
  projectOwner: PO,
  primaryTechnicalLead: TL1,
  secondaryTechnicalLead: TL2,
};

let licencePlate = '';

// TODO: add tests for ministry roles
describe('List Private Cloud Product Requests - Permissions', () => {
  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByEmail(PO.email);

    const requestData = createSamplePrivateCloudProductData({
      data: { ...memberData, ministry: $Enums.Ministry.PSA, cluster: $Enums.Cluster.SILVER },
    });
    const res1 = await createPrivateCloudProject(requestData);
    const dat1 = await res1.json();
    licencePlate = dat1.licencePlate;

    expect(res1.status).toBe(200);

    await mockSessionByRole('admin');

    const res2 = await makePrivateCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      decision: $Enums.DecisionStatus.APPROVED,
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
