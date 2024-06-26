import { expect } from '@jest/globals';
import { $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers, findMockUserByIdr, findOhterMockUsers } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import { createPublicCloudProject, editPublicCloudProject } from '@/services/api-test/public-cloud/products';
import { searchPublicCloudRequests, makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';

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
describe('Search Public Cloud Requests - Permissions', () => {
  it('should successfully delete all public cloud products', async () => {
    await Promise.all([prisma.publicCloudProject.deleteMany(), prisma.publicCloudRequest.deleteMany()]);
  });

  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByEmail(PO.email);

    const requestData = createSamplePublicCloudProductData({
      data: { ...memberData, ministry: $Enums.Ministry.PSA, provider: $Enums.Provider.AWS },
    });
    const res1 = await createPublicCloudProject(requestData);
    const dat1 = await res1.json();
    expect(res1.status).toBe(200);

    await mockSessionByRole('admin');

    const res2 = await makePublicCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      decision: $Enums.DecisionStatus.APPROVED,
    });
    expect(res2.status).toBe(200);

    const res3 = await provisionPublicCloudProject(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully search 1 request by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await searchPublicCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await searchPublicCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await searchPublicCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully create a product by a random user and approved by admin', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const requestData = createSamplePublicCloudProductData({
      data: { ...randomMemberData, ministry: $Enums.Ministry.PSA, provider: $Enums.Provider.AWS },
    });
    const res1 = await createPublicCloudProject(requestData);
    const dat1 = await res1.json();
    expect(res1.status).toBe(200);

    await mockSessionByRole('admin');

    const res2 = await makePublicCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      decision: $Enums.DecisionStatus.APPROVED,
    });
    expect(res2.status).toBe(200);

    const res3 = await provisionPublicCloudProject(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully search 1 request by the random user', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const res1 = await searchPublicCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await searchPublicCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await searchPublicCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 request by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await searchPublicCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 2 requests by admin', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPublicCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(2);
  });
});

describe('Search Public Cloud Requests - Validations', () => {
  it('should successfully delete all public cloud products', async () => {
    await Promise.all([prisma.publicCloudProject.deleteMany(), prisma.publicCloudRequest.deleteMany()]);
  });

  it('should successfully create products by admin', async () => {
    await mockSessionByRole('admin');

    const datasets = [];
    datasets.push(
      createSamplePublicCloudProductData({ data: { ministry: $Enums.Ministry.AEST, provider: $Enums.Provider.AWS } }),
      createSamplePublicCloudProductData({ data: { ministry: $Enums.Ministry.AEST, provider: $Enums.Provider.AZURE } }),
      createSamplePublicCloudProductData({ data: { ministry: $Enums.Ministry.AEST, provider: $Enums.Provider.AWS } }),
      createSamplePublicCloudProductData({ data: { ministry: $Enums.Ministry.AEST, provider: $Enums.Provider.AZURE } }),
      createSamplePublicCloudProductData({ data: { ministry: $Enums.Ministry.AEST, provider: $Enums.Provider.AWS } }),
      createSamplePublicCloudProductData({ data: { ministry: $Enums.Ministry.CITZ, provider: $Enums.Provider.AZURE } }),
      createSamplePublicCloudProductData({ data: { ministry: $Enums.Ministry.CITZ, provider: $Enums.Provider.AWS } }),
      createSamplePublicCloudProductData({ data: { ministry: $Enums.Ministry.CITZ, provider: $Enums.Provider.AZURE } }),
      createSamplePublicCloudProductData({ data: { ministry: $Enums.Ministry.CITZ, provider: $Enums.Provider.AWS } }),
      createSamplePublicCloudProductData({
        data: { ministry: $Enums.Ministry.CITZ, provider: $Enums.Provider.AZURE, name: '______name______' },
      }),
    );

    const results = await Promise.all(
      datasets.map(async (data) => {
        const res1 = await createPublicCloudProject(data);
        const dat1 = await res1.json();

        const req = await makePublicCloudRequestDecision(dat1.id, {
          ...dat1.decisionData,
          decision: $Enums.DecisionStatus.APPROVED,
        });

        await provisionPublicCloudProject(dat1.licencePlate);
        return req;
      }),
    );

    const firstReq = await results[0].json();
    const res = await editPublicCloudProject(firstReq.licencePlate, {
      ...firstReq.decisionData,
      name: `${firstReq.decisionData.name}updated`,
    });

    expect(res.status).toBe(200);
  });

  it('should successfully search 10 requests by admin', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPublicCloudRequests({ includeInactive: true });
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(11);
  });

  it('should successfully search 1 requests by admin', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPublicCloudRequests({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 5 requests by admin with search criteria', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPublicCloudRequests({
      ministry: $Enums.Ministry.AEST,
      provider: $Enums.Provider.AWS,
      includeInactive: true,
    });

    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(4);
  });

  it('should successfully search 1 request by admin with search criteria', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPublicCloudRequests({
      search: '______name______',
      includeInactive: true,
    });

    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });
});
