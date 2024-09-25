import { expect } from '@jest/globals';
import { DecisionStatus, Ministry, Provider, TaskType, TaskStatus, ProjectStatus } from '@prisma/client';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers, findMockUserByIdr, findOtherMockUsers } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import {
  createPublicCloudProject,
  searchPublicCloudProjects,
  signPublicCloudMou,
  reviewPublicCloudMou,
} from '@/services/api-test/public-cloud/products';
import { makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';

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
describe('Search Public Cloud Products - Permissions', () => {
  it('should successfully delete all public cloud products', async () => {
    await prisma.publicCloudProject.deleteMany();
  });

  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByEmail(PO.email);

    const requestData = createSamplePublicCloudProductData({
      data: { ...memberData },
    });
    const res1 = await createPublicCloudProject(requestData);
    const dat1 = await res1.json();
    expect(res1.status).toBe(200);

    const task1 = await prisma.task.findFirst({
      where: {
        type: TaskType.SIGN_MOU,
        status: TaskStatus.ASSIGNED,
        data: {
          equals: {
            requestId: dat1.id,
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

      await mockSessionByRole('billing-reviewer');
      const task2 = await prisma.task.findFirst({
        where: {
          type: TaskType.REVIEW_MOU,
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

    await mockSessionByRole('admin');

    const res2 = await makePublicCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      accountCoding: dat1.decisionData.billing.accountCoding,
      decision: DecisionStatus.APPROVED,
    });
    expect(res2.status).toBe(200);

    const res3 = await provisionPublicCloudProject(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully search 1 project by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await searchPublicCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 project by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await searchPublicCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 project by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await searchPublicCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully create a product by a random user and approved by admin', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const requestData = createSamplePublicCloudProductData({
      data: { ...randomMemberData },
    });
    const res1 = await createPublicCloudProject(requestData);
    const dat1 = await res1.json();
    expect(res1.status).toBe(200);

    await mockSessionByRole('admin');

    const res2 = await makePublicCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      accountCoding: dat1.decisionData.billing.accountCoding,
      decision: DecisionStatus.APPROVED,
    });
    expect(res2.status).toBe(200);

    const res3 = await provisionPublicCloudProject(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully search 1 project by the random user', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const res1 = await searchPublicCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 project by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await searchPublicCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 project by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await searchPublicCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 1 project by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await searchPublicCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully search 2 projects by admin', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPublicCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(2);
  });
});

describe('Search Public Cloud Products - Validations', () => {
  it('should successfully delete all public cloud products', async () => {
    await prisma.publicCloudProject.deleteMany();
  });

  it('should successfully create products by admin', async () => {
    await mockSessionByRole('admin');

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

    await Promise.all(
      datasets.map(async (data) => {
        const res1 = await createPublicCloudProject(data);
        const dat1 = await res1.json();

        await makePublicCloudRequestDecision(dat1.id, {
          ...dat1.decisionData,
          accountCoding: dat1.decisionData.billing.accountCoding,
          decision: DecisionStatus.APPROVED,
        });

        await provisionPublicCloudProject(dat1.licencePlate);
      }),
    );
  });

  it('should successfully search 10 projects by admin', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPublicCloudProjects({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(10);
  });

  it('should successfully search 5 projects by admin with search criteria', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPublicCloudProjects({
      ministries: [Ministry.AEST],
      providers: [Provider.AWS],
      status: [ProjectStatus.ACTIVE],
    });

    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(3);
  });

  it('should successfully search 1 project by admin with search criteria', async () => {
    await mockSessionByRole('admin');

    const res1 = await searchPublicCloudProjects({
      search: '______name______',
    });

    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });
});
