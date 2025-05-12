import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { Ministry, Cluster, DecisionStatus, RequestType } from '@/prisma/client';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { mockTeamServiceAccount } from '@/services/api-test/core';
import { createPrivateCloudProduct, editPrivateCloudProduct } from '@/services/api-test/private-cloud/products';
import {
  searchPrivateCloudRequests,
  makePrivateCloudRequestDecision,
} from '@/services/api-test/private-cloud/requests';
import { provisionPrivateCloudProduct } from '@/services/api-test/v1/private-cloud';
import { PrivateCloudSampleProductData } from '@/types/private-cloud';

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
    await Promise.all([prisma.privateCloudProduct.deleteMany(), prisma.privateCloudRequest.deleteMany()]);
  });

  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByEmail(PO.email);

    const requestData = createSamplePrivateCloudProductData({
      data: { ...memberData, ministry: Ministry.PSA, cluster: Cluster.SILVER },
    });
    const res1 = await createPrivateCloudProduct(requestData);
    const dat1 = await res1.json();
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

    const requestData = createSamplePrivateCloudProductData({
      data: { ...randomMemberData, ministry: Ministry.PSA, cluster: Cluster.SILVER },
    });
    const res1 = await createPrivateCloudProduct(requestData);
    const dat1 = await res1.json();
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
    await Promise.all([prisma.privateCloudProduct.deleteMany(), prisma.privateCloudRequest.deleteMany()]);
  });

  it('should successfully create products by admin', async () => {
    await mockSessionByRole(GlobalRole.PrivateAdmin);

    const datasets: PrivateCloudSampleProductData[] = [];
    datasets.push(
      createSamplePrivateCloudProductData({
        data: { ministry: Ministry.AEST, cluster: Cluster.CLAB },
      }) as PrivateCloudSampleProductData,
      createSamplePrivateCloudProductData({
        data: { ministry: Ministry.AEST, cluster: Cluster.KLAB },
      }) as PrivateCloudSampleProductData,
      createSamplePrivateCloudProductData({
        data: { ministry: Ministry.AEST, cluster: Cluster.CLAB },
      }) as PrivateCloudSampleProductData,
      createSamplePrivateCloudProductData({
        data: { ministry: Ministry.AEST, cluster: Cluster.KLAB },
      }) as PrivateCloudSampleProductData,
      createSamplePrivateCloudProductData({
        data: { ministry: Ministry.AEST, cluster: Cluster.CLAB },
      }) as PrivateCloudSampleProductData,
      createSamplePrivateCloudProductData({
        data: { ministry: Ministry.CITZ, cluster: Cluster.KLAB },
      }) as PrivateCloudSampleProductData,
      createSamplePrivateCloudProductData({
        data: { ministry: Ministry.CITZ, cluster: Cluster.CLAB },
      }) as PrivateCloudSampleProductData,
      createSamplePrivateCloudProductData({
        data: { ministry: Ministry.CITZ, cluster: Cluster.KLAB },
      }) as PrivateCloudSampleProductData,
      createSamplePrivateCloudProductData({
        data: { ministry: Ministry.CITZ, cluster: Cluster.CLAB },
      }) as PrivateCloudSampleProductData,
      createSamplePrivateCloudProductData({
        data: { ministry: Ministry.CITZ, cluster: Cluster.KLAB, name: '______name______' },
      }) as PrivateCloudSampleProductData,
    );

    const results = await Promise.all(
      datasets.map(async (data) => {
        const res1 = await createPrivateCloudProduct(data);
        const dat1 = await res1.json();

        await mockSessionByRole(GlobalRole.PrivateReviewer);
        const req = await makePrivateCloudRequestDecision(dat1.id, {
          ...dat1.decisionData,
          type: RequestType.CREATE,
          decision: DecisionStatus.APPROVED,
        });

        await mockTeamServiceAccount(['private-admin']);
        await provisionPrivateCloudProduct(dat1.licencePlate);
        return req;
      }),
    );

    await mockSessionByRole(GlobalRole.PrivateAdmin);
    const firstReq = await results[0].json();
    const res = await editPrivateCloudProduct(firstReq.licencePlate, {
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
