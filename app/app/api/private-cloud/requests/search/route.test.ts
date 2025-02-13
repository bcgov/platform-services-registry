import { expect } from '@jest/globals';
import { Ministry, Cluster, DecisionStatus, RequestType } from '@prisma/client';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePrivateCloudProductData, getMembersData } from '@/helpers/mock-resources';
import { mockNoRoleUsers, findMockUserByIdr, findOtherMockUsers } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPrivateCloudProject } from '@/services/api-test/private-cloud';
import { createPrivateCloudProject, editPrivateCloudProject } from '@/services/api-test/private-cloud/products';
import {
  searchPrivateCloudRequests,
  makePrivateCloudRequestDecision,
} from '@/services/api-test/private-cloud/requests';

let PO, TL1, TL2, RANDOM1, RANDOM2, RANDOM3;
let memberData, randomMemberData;

beforeAll(async () => {
  [PO, TL1, TL2, RANDOM1, RANDOM2, RANDOM3, memberData, randomMemberData] = await getMembersData(true);
});

// TODO: add tests for ministry roles
describe('Search Private Cloud Requests - Permissions', () => {
  it('should successfully delete all private cloud products', async () => {
    await Promise.all([prisma.privateCloudProject.deleteMany(), prisma.privateCloudRequest.deleteMany()]);
  });

  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByEmail(PO.email);

    const requestData = await createSamplePrivateCloudProductData({
      data: { ...memberData, ministry: Ministry.PSA, cluster: Cluster.SILVER },
    });
    const res1 = await createPrivateCloudProject(requestData);
    const dat1 = await res1.json();
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

  it('should successfully search 1 request by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await searchPrivateCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await searchPrivateCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await searchPrivateCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully create a product by a random user and approved by admin', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const requestData = await createSamplePrivateCloudProductData({
      data: { ...randomMemberData, ministry: Ministry.PSA, cluster: Cluster.SILVER },
    });
    const res1 = await createPrivateCloudProject(requestData);
    const dat1 = await res1.json();
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

  it('should successfully search 1 request by the random user', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const res1 = await searchPrivateCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await searchPrivateCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await searchPrivateCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await searchPrivateCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 2 requests by admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await searchPrivateCloudRequests({});
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
    await mockSessionByRole(GlobalRole.PrivateAdmin);

    const datasets: any[] = [];
    datasets.push(
      await createSamplePrivateCloudProductData({ data: { ministry: Ministry.AEST, cluster: Cluster.CLAB } }),
      await createSamplePrivateCloudProductData({ data: { ministry: Ministry.AEST, cluster: Cluster.KLAB } }),
      await createSamplePrivateCloudProductData({ data: { ministry: Ministry.AEST, cluster: Cluster.CLAB } }),
      await createSamplePrivateCloudProductData({ data: { ministry: Ministry.AEST, cluster: Cluster.KLAB } }),
      await createSamplePrivateCloudProductData({ data: { ministry: Ministry.AEST, cluster: Cluster.CLAB } }),
      await createSamplePrivateCloudProductData({ data: { ministry: Ministry.CITZ, cluster: Cluster.KLAB } }),
      await createSamplePrivateCloudProductData({ data: { ministry: Ministry.CITZ, cluster: Cluster.CLAB } }),
      await createSamplePrivateCloudProductData({ data: { ministry: Ministry.CITZ, cluster: Cluster.KLAB } }),
      await createSamplePrivateCloudProductData({ data: { ministry: Ministry.CITZ, cluster: Cluster.CLAB } }),
      await createSamplePrivateCloudProductData({
        data: { ministry: Ministry.CITZ, cluster: Cluster.KLAB, name: '______name______' },
      }),
    );

    const results = await Promise.all(
      datasets.map(async (data) => {
        const res1 = await createPrivateCloudProject(data);
        const dat1 = await res1.json();

        await mockSessionByRole(GlobalRole.PrivateReviewer);
        const req = await makePrivateCloudRequestDecision(dat1.id, {
          ...dat1.decisionData,
          type: RequestType.CREATE,
          decision: DecisionStatus.APPROVED,
        });

        await provisionPrivateCloudProject(dat1.licencePlate);
        return req;
      }),
    );

    await mockSessionByRole(GlobalRole.PrivateAdmin);
    const firstReq = await results[0].json();
    const res = await editPrivateCloudProject(firstReq.licencePlate, {
      ...firstReq.decisionData,
      name: `${firstReq.decisionData.name} - updated`,
    });

    expect(res.status).toBe(200);
  });

  it('should successfully search 11 requests by admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await searchPrivateCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    // 10 Create requests, 1 Edit request
    expect(dat1.totalCount).toBe(11);
  });

  it('should successfully search 1 requests by admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await searchPrivateCloudRequests({ status: [DecisionStatus.APPROVED, DecisionStatus.AUTO_APPROVED] });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 5 requests by admin with search criteria', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await searchPrivateCloudRequests({
      ministries: [Ministry.AEST],
      clusters: [Cluster.CLAB],
    });

    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(4);
  });

  it('should successfully search 1 request by admin with search criteria', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await searchPrivateCloudRequests({
      search: '______name______',
    });

    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });
});
