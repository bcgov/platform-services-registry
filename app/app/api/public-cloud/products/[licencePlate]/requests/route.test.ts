import { expect } from '@jest/globals';
import { $Enums, TaskType, TaskStatus } from '@prisma/client';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers, findMockUserByIdr, findOtherMockUsers } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import {
  createPublicCloudProject,
  listPublicCloudProductRequests,
  signPublicCloudMou,
  reviewPublicCloudMou,
} from '@/services/api-test/public-cloud/products';
import { makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';

const PO = mockNoRoleUsers[0];
const TL1 = mockNoRoleUsers[1];
const TL2 = mockNoRoleUsers[2];
const RANDOM1 = mockNoRoleUsers[3];

const memberData = {
  projectOwner: PO,
  primaryTechnicalLead: TL1,
  secondaryTechnicalLead: TL2,
};

let licencePlate = '';

// TODO: add tests for ministry roles
describe('List Public Cloud Product Requests - Permissions', () => {
  it('should successfully create a product by PO and approved by admin', async () => {
    await mockSessionByEmail(PO.email);

    const requestData = createSamplePublicCloudProductData({
      data: { ...memberData, ministry: $Enums.Ministry.PSA, provider: $Enums.Provider.AWS },
    });
    const res1 = await createPublicCloudProject(requestData);
    const dat1 = await res1.json();
    licencePlate = dat1.licencePlate;

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
      decision: $Enums.DecisionStatus.APPROVED,
    });
    expect(res2.status).toBe(200);

    const res3 = await provisionPublicCloudProject(dat1.licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should successfully list 1 request by PO', async () => {
    await mockSessionByEmail(PO.email);

    const res1 = await listPublicCloudProductRequests(licencePlate, false);
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.length).toBe(1);
  });

  it('should successfully list 1 request by TL1', async () => {
    await mockSessionByEmail(TL1.email);

    const res1 = await listPublicCloudProductRequests(licencePlate, false);
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.length).toBe(1);
  });

  it('should successfully list 1 request by TL2', async () => {
    await mockSessionByEmail(TL2.email);

    const res1 = await listPublicCloudProductRequests(licencePlate, false);
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.length).toBe(1);
  });

  it('should successfully list 0 request by a random user', async () => {
    await mockSessionByEmail(RANDOM1.email);

    const res1 = await listPublicCloudProductRequests(licencePlate, false);
    expect(res1.status).toBe(200);
    const dat1 = await res1.json();

    expect(dat1.length).toBe(0);
  });
});
