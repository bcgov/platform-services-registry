import { expect } from '@jest/globals';
import { $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers, findMockUserByIdr, findOtherMockUsers } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPrivateCloudProject } from '@/services/api-test/private-cloud';
import { createPrivateCloudProject, editPrivateCloudProject } from '@/services/api-test/private-cloud/products';
import {
  searchPrivateCloudRequests,
  makePrivateCloudRequestDecision,
} from '@/services/api-test/private-cloud/requests';

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

// TODO: add tests for ministry roles
describe('Search Private Cloud Requests - Permissions', () => {
  it('should successfully delete all private cloud products', async () => {
    await Promise.all([prisma.privateCloudProject.deleteMany(), prisma.privateCloudRequest.deleteMany()]);
  });

  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByEmail(PO.email);

    const requestData = createSamplePrivateCloudProductData({
      data: { ...memberData, ministry: $Enums.Ministry.PSA, cluster: $Enums.Cluster.SILVER },
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

  it('should successfully search 1 request by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await searchPrivateCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await searchPrivateCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await searchPrivateCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully create a product by a random user and approved by admin', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const requestData = createSamplePrivateCloudProductData({
      data: { ...randomMemberData, ministry: $Enums.Ministry.PSA, cluster: $Enums.Cluster.SILVER },
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

  it('should successfully search 1 request by the random user', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const res1 = await searchPrivateCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await searchPrivateCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await searchPrivateCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await searchPrivateCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 2 requests by admin', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPrivateCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(2);
  });
});

describe('Search Private Cloud Requests - Validations', () => {
  it('should successfully delete all private cloud products', async () => {
    await Promise.all([prisma.privateCloudProject.deleteMany(), prisma.privateCloudRequest.deleteMany()]);
  });

  it('should successfully create products by admin', async () => {
    await mockSessionByRole('admin');

    const datasets = [];
    datasets.push(
      createSamplePrivateCloudProductData({ data: { ministry: $Enums.Ministry.AEST, cluster: $Enums.Cluster.CLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: $Enums.Ministry.AEST, cluster: $Enums.Cluster.KLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: $Enums.Ministry.AEST, cluster: $Enums.Cluster.CLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: $Enums.Ministry.AEST, cluster: $Enums.Cluster.KLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: $Enums.Ministry.AEST, cluster: $Enums.Cluster.CLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: $Enums.Ministry.CITZ, cluster: $Enums.Cluster.KLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: $Enums.Ministry.CITZ, cluster: $Enums.Cluster.CLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: $Enums.Ministry.CITZ, cluster: $Enums.Cluster.KLAB } }),
      createSamplePrivateCloudProductData({ data: { ministry: $Enums.Ministry.CITZ, cluster: $Enums.Cluster.CLAB } }),
      createSamplePrivateCloudProductData({
        data: { ministry: $Enums.Ministry.CITZ, cluster: $Enums.Cluster.KLAB, name: '______name______' },
      }),
    );

    const results = await Promise.all(
      datasets.map(async (data) => {
        const res1 = await createPrivateCloudProject(data);
        const dat1 = await res1.json();

        const req = await makePrivateCloudRequestDecision(dat1.id, {
          ...dat1.decisionData,
          decision: $Enums.DecisionStatus.APPROVED,
        });

        await provisionPrivateCloudProject(dat1.licencePlate);
        return req;
      }),
    );

    const firstReq = await results[0].json();
    const res = await editPrivateCloudProject(firstReq.licencePlate, {
      ...firstReq.decisionData,
      name: `${firstReq.decisionData.name} - updated`,
    });

    expect(res.status).toBe(200);
  });

  it('should successfully search 10 requests by admin', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPrivateCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(11);
  });

  it('should successfully search 1 requests by admin', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPrivateCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 5 requests by admin with search criteria', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPrivateCloudRequests({
      ministry: $Enums.Ministry.AEST,
      cluster: $Enums.Cluster.CLAB,
      includeInactive: true,
    });

    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(4);
  });

  it('should successfully search 1 request by admin with search criteria', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPrivateCloudRequests({
      search: '______name______',
      includeInactive: true,
    });

    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });
});
