import { expect } from '@jest/globals';
import { $Enums } from '@prisma/client';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers, findMockUserByIdr, findOhterMockUsers } from '@/helpers/mock-users';
import {
  mockSessionByEmail,
  mockSessionByRole,
  mockUserServiceAccountByEmail,
  mockUserServiceAccountByRole,
} from '@/services/api-test/core';
import { provisionPrivateCloudProject } from '@/services/api-test/private-cloud';
import { createPrivateCloudProject } from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';
import { listPrivateCloudProjectApi } from '@/services/api-test/v1/private-cloud/products';

const PO = mockNoRoleUsers[0];
const TL1 = mockNoRoleUsers[1];
const TL2 = mockNoRoleUsers[2];
const RANDOM1 = mockNoRoleUsers[3];
const RANDOM2 = mockNoRoleUsers[4];
const RANDOM3 = mockNoRoleUsers[5];

const memberData = {
  projectOwner: PO,
  primaryTechnicalLead: TL1,
  secondaryTechnicalLead: TL2,
};

const randomMemberData = {
  projectOwner: RANDOM1,
  primaryTechnicalLead: RANDOM2,
  secondaryTechnicalLead: RANDOM3,
};

describe('API: List Private Cloud Products - Permissions', () => {
  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByEmail(PO.email);

    const requestData = createSamplePrivateCloudProductData({
      data: { ...memberData },
    });
    const res1 = await createPrivateCloudProject(requestData);
    const dat1 = await res1.json();
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

  it('should successfully list 1 project by PO', async () => {
    await mockUserServiceAccountByEmail(PO.email);

    const res1 = await listPrivateCloudProjectApi();
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully list 1 project by TL1', async () => {
    await mockUserServiceAccountByEmail(TL1.email);

    const res1 = await listPrivateCloudProjectApi();
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully list 1 project by TL2', async () => {
    await mockUserServiceAccountByEmail(TL2.email);

    const res1 = await listPrivateCloudProjectApi();
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully create a product by a random user and approved by admin', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const requestData = createSamplePrivateCloudProductData({
      data: { ...randomMemberData },
    });
    const res1 = await createPrivateCloudProject(requestData);
    const dat1 = await res1.json();
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

  it('should successfully list 1 project by the random user', async () => {
    await mockUserServiceAccountByEmail(RANDOM1.email);

    const res1 = await listPrivateCloudProjectApi();
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully list 1 project by PO', async () => {
    await mockUserServiceAccountByEmail(PO.email);

    const res1 = await listPrivateCloudProjectApi();
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully list 1 project by TL1', async () => {
    await mockUserServiceAccountByEmail(TL1.email);

    const res1 = await listPrivateCloudProjectApi();
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully list 1 project by TL2', async () => {
    await mockUserServiceAccountByEmail(TL2.email);

    const res1 = await listPrivateCloudProjectApi();
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully list 2 projects by admin', async () => {
    await mockUserServiceAccountByRole('admin');

    const res1 = await listPrivateCloudProjectApi();
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(2);
  });
});
