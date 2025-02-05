import { expect } from '@jest/globals';
import { Ministry, Provider, DecisionStatus, TaskType, TaskStatus, RequestType } from '@prisma/client';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers, findMockUserByIdr, findOtherMockUsers, upsertMockUser } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import {
  createPublicCloudProject,
  editPublicCloudProject,
  signPublicCloudMou,
  reviewPublicCloudMou,
} from '@/services/api-test/public-cloud/products';
import { searchPublicCloudRequests, makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';

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

// Create users in advance before running tests
beforeAll(async () => {
  await Promise.all([PO, TL1, TL2, EA, RANDOM1, RANDOM2, RANDOM3, RANDOM4].map((user) => upsertMockUser(user)));

  const [createdPO, createdTL1, createdTL2, createdEA, createdRANDOM1, createdRANDOM2, createdRANDOM3, createdRANDOM4] =
    await Promise.all([
      prisma.user.findUnique({ where: { email: PO.email } }),
      prisma.user.findUnique({ where: { email: TL1.email } }),
      prisma.user.findUnique({ where: { email: TL2.email } }),
      prisma.user.findUnique({ where: { email: EA.email } }),
      prisma.user.findUnique({ where: { email: RANDOM1.email } }),
      prisma.user.findUnique({ where: { email: RANDOM2.email } }),
      prisma.user.findUnique({ where: { email: RANDOM3.email } }),
      prisma.user.findUnique({ where: { email: RANDOM4.email } }),
    ]);

  memberData.projectOwner.id = createdPO!.id;
  memberData.primaryTechnicalLead.id = createdTL1!.id;
  memberData.secondaryTechnicalLead.id = createdTL2!.id;
  memberData.expenseAuthority.id = createdEA!.id;

  randomMemberData.projectOwner.id = createdRANDOM1!.id;
  randomMemberData.primaryTechnicalLead.id = createdRANDOM2!.id;
  randomMemberData.secondaryTechnicalLead.id = createdRANDOM3!.id;
  randomMemberData.expenseAuthority.id = createdRANDOM4!.id;
});

// TODO: add tests for ministry roles
describe('Search Public Cloud Requests - Permissions', () => {
  it('should successfully delete all public cloud products', async () => {
    await Promise.all([prisma.publicCloudProject.deleteMany(), prisma.publicCloudRequest.deleteMany()]);
  });

  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByEmail(PO.email);

    const requestData = createSamplePublicCloudProductData({
      data: { ...memberData, ministry: Ministry.PSA, provider: Provider.AWS },
    });
    const res1 = await createPublicCloudProject(requestData);
    const dat1 = await res1.json();
    expect(res1.status).toBe(200);

    const task1 = await prisma.task.findFirst({
      where: {
        type: TaskType.SIGN_PUBLIC_CLOUD_MOU,
        status: TaskStatus.ASSIGNED,
        data: {
          equals: {
            licencePlate: dat1.licencePlate,
          },
        },
      },
    });

    if (task1) {
      await mockSessionByEmail(dat1.decisionData.expenseAuthority.email);
      await signPublicCloudMou(dat1.licencePlate, {
        taskId: task1?.id ?? '',
        confirmed: true,
      });

      await mockSessionByRole(GlobalRole.BillingReviewer);
      const task2 = await prisma.task.findFirst({
        where: {
          type: TaskType.REVIEW_PUBLIC_CLOUD_MOU,
          status: TaskStatus.ASSIGNED,
          data: {
            equals: {
              licencePlate: dat1.licencePlate,
            },
          },
        },
      });

      await reviewPublicCloudMou(dat1.licencePlate, {
        taskId: task2?.id ?? '',
        decision: 'APPROVE',
      });
    }

    await mockSessionByRole(GlobalRole.PublicReviewer);

    const res2 = await makePublicCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      type: RequestType.CREATE,
      accountCoding: dat1.decisionData.billing.accountCoding,
      decision: DecisionStatus.APPROVED,
    });

    expect(res2.status).toBe(200);

    const res3 = await provisionPublicCloudProject(dat1.licencePlate);
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
    const res1 = await createPublicCloudProject(requestData);
    const dat1 = await res1.json();
    expect(res1.status).toBe(200);

    await mockSessionByRole(GlobalRole.PublicReviewer);

    const res2 = await makePublicCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      type: RequestType.CREATE,
      accountCoding: dat1.decisionData.billing.accountCoding,
      decision: DecisionStatus.APPROVED,
    });
    expect(res2.status).toBe(200);

    const res3 = await provisionPublicCloudProject(dat1.licencePlate);
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
    await Promise.all([prisma.publicCloudProject.deleteMany(), prisma.publicCloudRequest.deleteMany()]);
  });

  it('should successfully create products by admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const datasets = [];
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
        const res1 = await createPublicCloudProject(data);
        const dat1 = await res1.json();

        const task1 = await prisma.task.findFirst({
          where: {
            type: TaskType.SIGN_PUBLIC_CLOUD_MOU,
            status: TaskStatus.ASSIGNED,
            data: {
              equals: {
                licencePlate: dat1.licencePlate,
              },
            },
          },
        });

        if (task1) {
          await mockSessionByEmail(dat1.decisionData.expenseAuthority.email);
          await signPublicCloudMou(dat1.licencePlate, {
            taskId: task1?.id ?? '',
            confirmed: true,
          });

          await mockSessionByRole(GlobalRole.BillingReviewer);
          const task2 = await prisma.task.findFirst({
            where: {
              type: TaskType.REVIEW_PUBLIC_CLOUD_MOU,
              status: TaskStatus.ASSIGNED,
              data: {
                equals: {
                  licencePlate: dat1.licencePlate,
                },
              },
            },
          });

          await reviewPublicCloudMou(dat1.licencePlate, {
            taskId: task2?.id ?? '',
            decision: 'APPROVE',
          });
        }

        await mockSessionByRole(GlobalRole.PublicReviewer);

        const req = await makePublicCloudRequestDecision(dat1.id, {
          ...dat1.decisionData,
          type: RequestType.CREATE,
          accountCoding: dat1.decisionData.billing.accountCoding,
          decision: DecisionStatus.APPROVED,
        });

        await provisionPublicCloudProject(dat1.licencePlate);
        return req;
      }),
    );

    await mockSessionByRole(GlobalRole.Admin);
    const firstReq = await results[0].json();
    const res = await editPublicCloudProject(firstReq.licencePlate, {
      ...firstReq.decisionData,
      accountCoding: firstReq.decisionData.billing.accountCoding,
      name: `${firstReq.decisionData.name}updated`,
    });

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
