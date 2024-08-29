import { expect } from '@jest/globals';
import { $Enums, TaskType, TaskStatus } from '@prisma/client';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import { createPublicCloudProject } from '@/services/api-test/public-cloud/products';
import {
  makePublicCloudRequestDecision,
  signPublicCloudMou,
  reviewPublicCloudMou,
} from '@/services/api-test/public-cloud/requests';

const productData = {
  main: createSamplePublicCloudProductData(),
};

const requests = {
  create: null as any,
};

describe('Provision Public Cloud Request', () => {
  it('should successfully submit a create request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await createPublicCloudProject(productData.main);
    expect(response.status).toBe(200);

    requests.create = await response.json();
  });

  it('should successfully sign the billing by EA', async () => {
    await mockSessionByEmail(requests.create.decisionData.expenseAuthority.email);

    const task = await prisma.task.findFirst({
      where: {
        type: TaskType.SIGN_MOU,
        status: TaskStatus.ASSIGNED,
        data: {
          equals: {
            requestId: requests.create.id,
          },
        },
      },
    });

    expect(task).toBeTruthy();

    const response = await signPublicCloudMou(requests.create.id, {
      taskId: task?.id ?? '',
      confirmed: true,
    });

    expect(response.status).toBe(200);
  });

  it('should successfully review the billing by billing reviewer', async () => {
    await mockSessionByRole('billing-reviewer');

    const task = await prisma.task.findFirst({
      where: {
        type: TaskType.REVIEW_MOU,
        status: TaskStatus.ASSIGNED,
        data: {
          equals: {
            requestId: requests.create.id,
          },
        },
      },
    });

    expect(task).toBeTruthy();

    const response = await reviewPublicCloudMou(requests.create.id, {
      taskId: task?.id ?? '',
      decision: 'APPROVE',
    });

    expect(response.status).toBe(200);
  });

  it('should successfully approve the request by admin', async () => {
    await mockSessionByRole('admin');

    const response = await makePublicCloudRequestDecision(requests.create.id, {
      ...requests.create.decisionData,
      accountCoding: requests.create.decisionData.billing.accountCoding,
      decision: $Enums.DecisionStatus.APPROVED,
    });

    expect(response.status).toBe(200);
  });

  it('should have the request decision status as APPROVED', async () => {
    await mockSessionByEmail();

    const request = await prisma.publicCloudRequest.findUnique({
      where: { id: requests.create.id },
      select: { decisionStatus: true },
    });
    expect(request).toBeTruthy();
    expect(request?.decisionStatus).toBe($Enums.DecisionStatus.APPROVED);
  });

  it('should successfully provision the request', async () => {
    await mockSessionByEmail();

    const response = await provisionPublicCloudProject(requests.create.licencePlate);
    expect(response.status).toBe(200);
  });

  it('should have the request decision status as PROVISIONED', async () => {
    await mockSessionByEmail();

    const request = await prisma.publicCloudRequest.findUnique({
      where: { id: requests.create.id },
      select: { decisionStatus: true },
    });

    expect(request).toBeTruthy();
    expect(request?.decisionStatus).toBe($Enums.DecisionStatus.PROVISIONED);
  });
});
