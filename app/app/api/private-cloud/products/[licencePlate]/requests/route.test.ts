import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { Cluster, DecisionStatus, RequestType } from '@/prisma/client';
import { mockSessionByIdirGuid, mockSessionByRole } from '@/services/api-test/core';
import { mockTeamServiceAccount } from '@/services/api-test/core';
import { createPrivateCloudProduct, listPrivateCloudProductRequests } from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';
import { provisionPrivateCloudProduct } from '@/services/api-test/v1/private-cloud';

const PO = mockNoRoleUsers[0];
const TL1 = mockNoRoleUsers[1];
const TL2 = mockNoRoleUsers[2];
const EA = mockNoRoleUsers[3];
const RANDOM1 = mockNoRoleUsers[4];

const memberData = {
  projectOwner: PO,
  primaryTechnicalLead: TL1,
  secondaryTechnicalLead: TL2,
  expenseAuthority: EA,
};

let licencePlate = '';

describe('List Private Cloud Product Requests - Permissions', () => {
  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByIdirGuid(PO.idirGuid);

    const requestData = createSamplePrivateCloudProductData({
      data: { ...memberData, cluster: Cluster.SILVER },
    });
    const res1 = await createPrivateCloudProduct(requestData);
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

    await mockTeamServiceAccount(['private-admin']);
    const res3 = await provisionPrivateCloudProduct(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully list 1 request by PO', async () => {
    await mockSessionByIdirGuid(PO.idirGuid);

    const res1 = await listPrivateCloudProductRequests(licencePlate, false);
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.length).toBe(1);
  });

  it('should successfully list 1 request by TL1', async () => {
    await mockSessionByIdirGuid(TL1.idirGuid);

    const res1 = await listPrivateCloudProductRequests(licencePlate, false);
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.length).toBe(1);
  });

  it('should successfully list 1 request by TL2', async () => {
    await mockSessionByIdirGuid(TL2.idirGuid);

    const res1 = await listPrivateCloudProductRequests(licencePlate, false);
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.length).toBe(1);
  });

  it('should successfully list 0 request by a random user', async () => {
    await mockSessionByIdirGuid(RANDOM1.idirGuid);

    const res1 = await listPrivateCloudProductRequests(licencePlate, false);
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.length).toBe(0);
  });
});
