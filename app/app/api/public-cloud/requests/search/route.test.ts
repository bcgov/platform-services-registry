import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import { defaultAccountCoding } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { Ministry, Provider, DecisionStatus, RequestType } from '@/prisma/client';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { mockTeamServiceAccount } from '@/services/api-test/core';
import {
  createPublicCloudProduct,
  editPublicCloudProduct,
  signPublicCloudBilling,
  reviewPublicCloudBilling,
  getTransformedLeadFields,
} from '@/services/api-test/public-cloud/products';
import { searchPublicCloudRequests, makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';
import { provisionPublicCloudProduct } from '@/services/api-test/v1/public-cloud';

const PO = mockNoRoleUsers[0];
const TL1 = mockNoRoleUsers[1];
const TL2 = mockNoRoleUsers[2];
const EA = mockNoRoleUsers[3];
const RANDOM1 = mockNoRoleUsers[4];
const RANDOM2 = mockNoRoleUsers[5];
const RANDOM3 = mockNoRoleUsers[6];
const RANDOM4 = mockNoRoleUsers[7];

const memberData = {
  projectOwner: PO,
  primaryTechnicalLead: TL1,
  secondaryTechnicalLead: TL2,
  expenseAuthority: EA,
};

const randomMemberData = {
  projectOwner: RANDOM1,
  primaryTechnicalLead: RANDOM2,
  secondaryTechnicalLead: RANDOM3,
  expenseAuthority: RANDOM4,
};

// TODO: add tests for ministry roles
describe('Search Public Cloud Requests - Permissions', () => {
  it('should successfully delete all public cloud products', async () => {
    await Promise.all([prisma.publicCloudProduct.deleteMany(), prisma.publicCloudRequest.deleteMany()]);
  });

  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByEmail(PO.email);

    const requestData = createSamplePublicCloudProductData({
      data: { ...memberData, ministry: Ministry.PSA, provider: Provider.AWS },
    });
    const res1 = await createPublicCloudProduct(requestData);
    const dat1 = await res1.json();
    expect(res1.status).toBe(200);

    const billing = await prisma.publicCloudBilling.findFirst({
      where: { licencePlate: dat1.licencePlate, signed: false, approved: false },
    });

    expect(billing).toBeTruthy();
    if (!billing) return;

    await mockSessionByEmail(dat1.decisionData.expenseAuthority.email);
    await signPublicCloudBilling(dat1.licencePlate, billing.id, {
      accountCoding: defaultAccountCoding,
      confirmed: true,
    });

    const billing2 = await prisma.publicCloudBilling.findFirst({
      where: { licencePlate: dat1.licencePlate, signed: true, approved: false },
    });

    expect(billing2).toBeTruthy();
    if (!billing2) return;

    await mockSessionByRole(GlobalRole.BillingReviewer);
    await reviewPublicCloudBilling(dat1.licencePlate, billing2.id, {
      decision: 'APPROVE',
    });

    await mockSessionByRole(GlobalRole.PublicReviewer);

    const res2 = await makePublicCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      type: RequestType.CREATE,
      decision: DecisionStatus.APPROVED,
    });

    expect(res2.status).toBe(200);

    await mockTeamServiceAccount(['public-admin']);
    const res3 = await provisionPublicCloudProduct(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully search 1 request by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await searchPublicCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await searchPublicCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await searchPublicCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully create a product by a random user and approved by admin', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const requestData = createSamplePublicCloudProductData({
      data: { ...randomMemberData, ministry: Ministry.PSA, provider: Provider.AWS },
    });
    const res1 = await createPublicCloudProduct(requestData);
    const dat1 = await res1.json();
    expect(res1.status).toBe(200);

    await mockSessionByRole(GlobalRole.PublicReviewer);

    const res2 = await makePublicCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      type: RequestType.CREATE,
      decision: DecisionStatus.APPROVED,
    });
    expect(res2.status).toBe(200);

    await mockTeamServiceAccount(['public-admin']);
    const res3 = await provisionPublicCloudProduct(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully search 1 request by the random user', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const res1 = await searchPublicCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await searchPublicCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await searchPublicCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await searchPublicCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 2 requests by admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await searchPublicCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(2);
  });
});

describe('Search Public Cloud Requests - Validations', () => {
  it('should successfully delete all public cloud products', async () => {
    await Promise.all([prisma.publicCloudProduct.deleteMany(), prisma.publicCloudRequest.deleteMany()]);
  });

  it('should successfully create products by admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const datasets: any[] = [];
    datasets.push(
      createSamplePublicCloudProductData({ data: { ministry: Ministry.AEST, provider: Provider.AWS } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.AEST, provider: Provider.AZURE } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.AEST, provider: Provider.AWS } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.AEST, provider: Provider.AZURE } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.AEST, provider: Provider.AWS } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.CITZ, provider: Provider.AZURE } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.CITZ, provider: Provider.AWS } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.CITZ, provider: Provider.AZURE } }),
      createSamplePublicCloudProductData({ data: { ministry: Ministry.CITZ, provider: Provider.AWS } }),
      createSamplePublicCloudProductData({
        data: { ministry: Ministry.CITZ, provider: Provider.AZURE, name: '______name______' },
      }),
    );

    const results = await Promise.all(
      datasets.map(async (data) => {
        const res1 = await createPublicCloudProduct(data);
        const dat1 = await res1.json();

        const billing = await prisma.publicCloudBilling.findFirst({
          where: { licencePlate: dat1.licencePlate, signed: false, approved: false },
        });

        expect(billing).toBeTruthy();
        if (!billing) return;

        await mockSessionByEmail(dat1.decisionData.expenseAuthority.email);
        await signPublicCloudBilling(dat1.licencePlate, billing.id, {
          accountCoding: defaultAccountCoding,
          confirmed: true,
        });

        await mockSessionByRole(GlobalRole.BillingReviewer);
        const billing2 = await prisma.publicCloudBilling.findFirst({
          where: { licencePlate: dat1.licencePlate, signed: true, approved: false },
        });

        expect(billing2).toBeTruthy();
        if (!billing2) return;

        await reviewPublicCloudBilling(dat1.licencePlate, billing2.id, {
          decision: 'APPROVE',
        });

        await mockSessionByRole(GlobalRole.PublicReviewer);

        const req = await makePublicCloudRequestDecision(dat1.id, {
          ...dat1.decisionData,
          type: RequestType.CREATE,
          decision: DecisionStatus.APPROVED,
        });

        await mockTeamServiceAccount(['public-admin']);
        await provisionPublicCloudProduct(dat1.licencePlate);
        return req;
      }),
    );

    await mockSessionByRole(GlobalRole.Admin);
    const firstReq = await results[0]?.json();

    const res = await editPublicCloudProduct(
      firstReq!.licencePlate,
      await getTransformedLeadFields({
        ...firstReq?.decisionData,
        name: `${firstReq?.decisionData.name}updated`,
      }),
    );

    expect(res.status).toBe(200);
  });

  it('should successfully search 11 requests by admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await searchPublicCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    // 10 Create requests, 1 Edit request
    expect(dat1.totalCount).toBe(11);
  });

  it('should successfully search 1 requests by admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await searchPublicCloudRequests({ status: [DecisionStatus.APPROVED, DecisionStatus.AUTO_APPROVED] });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 5 requests by admin with search criteria', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await searchPublicCloudRequests({
      ministries: [Ministry.AEST],
      providers: [Provider.AWS],
    });

    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(4);
  });

  it('should successfully search 1 request by admin with search criteria', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const res1 = await searchPublicCloudRequests({
      search: '______name______',
    });

    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });
});
