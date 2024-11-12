import { expect } from '@jest/globals';
import { DecisionStatus, ProjectStatus, Ministry, Provider, TaskType, TaskStatus, RequestType } from '@prisma/client';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers, findMockUserByIdr, findOtherMockUsers } from '@/helpers/mock-users';
import {
  mockSessionByEmail,
  mockSessionByRole,
  mockUserServiceAccountByEmail,
  mockUserServiceAccountByRole,
} from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import {
  createPublicCloudProject,
  signPublicCloudMou,
  reviewPublicCloudMou,
} from '@/services/api-test/public-cloud/products';
import { makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';
import { listPublicCloudProjectApi } from '@/services/api-test/v1/public-cloud/products';

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

describe('API: List Public Cloud Products - Permissions', () => {
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
        type: TaskType.SIGN_PRIVATE_CLOUD_MOU,
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
          type: TaskType.REVIEW_PRIVATE_CLOUD_MOU,
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

  it('should successfully list 1 project by PO', async () => {
    await mockUserServiceAccountByEmail(PO.email);

    const res1 = await listPublicCloudProjectApi({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully list 1 project by TL1', async () => {
    await mockUserServiceAccountByEmail(TL1.email);

    const res1 = await listPublicCloudProjectApi({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully list 1 project by TL2', async () => {
    await mockUserServiceAccountByEmail(TL2.email);

    const res1 = await listPublicCloudProjectApi({});
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

  it('should successfully list 1 project by the random user', async () => {
    await mockUserServiceAccountByEmail(RANDOM1.email);

    const res1 = await listPublicCloudProjectApi({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully list 1 project by PO', async () => {
    await mockUserServiceAccountByEmail(PO.email);

    const res1 = await listPublicCloudProjectApi({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully list 1 project by TL1', async () => {
    await mockUserServiceAccountByEmail(TL1.email);

    const res1 = await listPublicCloudProjectApi({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully list 1 project by TL2', async () => {
    await mockUserServiceAccountByEmail(TL2.email);

    const res1 = await listPublicCloudProjectApi({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(1);
  });

  it('should successfully list 2 projects by admin', async () => {
    await mockUserServiceAccountByRole(GlobalRole.Admin);

    const res1 = await listPublicCloudProjectApi({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(2);
  });
});

describe('API: List Public Cloud Products - Validations', () => {
  it('should successfully delete all public cloud products', async () => {
    await prisma.publicCloudProject.deleteMany();
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
      createSamplePublicCloudProductData({ data: { ministry: Ministry.CITZ, provider: Provider.AZURE } }),
    );

    await Promise.all(
      datasets.map(async (data) => {
        const res1 = await createPublicCloudProject(data);
        const dat1 = await res1.json();

        await mockSessionByRole(GlobalRole.PublicReviewer);
        await makePublicCloudRequestDecision(dat1.id, {
          ...dat1.decisionData,
          type: RequestType.CREATE,
          accountCoding: dat1.decisionData.billing.accountCoding,
          decision: DecisionStatus.APPROVED,
        });

        await provisionPublicCloudProject(dat1.licencePlate);
      }),
    );
  });

  it('should successfully list 10 projects by admin', async () => {
    await mockUserServiceAccountByRole(GlobalRole.Admin);

    const res1 = await listPublicCloudProjectApi({});
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(10);
  });

  it('should successfully list 5 projects by admin with search criteria', async () => {
    await mockUserServiceAccountByRole(GlobalRole.Admin);

    const res1 = await listPublicCloudProjectApi({
      ministry: Ministry.AEST,
      provider: Provider.AWS,
    });

    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(3);
  });

  it('should successfully list 0 projects by admin with search criteria', async () => {
    await mockUserServiceAccountByRole(GlobalRole.Admin);

    const res1 = await listPublicCloudProjectApi({
      status: ProjectStatus.INACTIVE,
    });

    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.totalCount).toBe(0);
  });

  it('should fail to list products due to an invalid ministry property', async () => {
    await mockUserServiceAccountByRole(GlobalRole.Admin);

    const response = await listPublicCloudProjectApi({ ministry: 'INVALID' as Ministry });

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'ministry')).not.toBeUndefined();
  });
});
