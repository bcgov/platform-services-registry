import { expect } from '@jest/globals';
import { DecisionStatus, TaskType, TaskStatus, RequestType } from '@prisma/client';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { findOtherMockUsers } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import {
  createPublicCloudProject,
  deletePublicCloudProject,
  signPublicCloudMou,
  reviewPublicCloudMou,
} from '@/services/api-test/public-cloud/products';
import { makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';

const productData = {
  main: createSamplePublicCloudProductData(),
};

const requests = {
  create: null as any,
  delete: null as any,
};

// TODO: add tests for ministry roles
describe('Delete Public Cloud Product - Permissions', () => {
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
            licencePlate: requests.create.licencePlate,
          },
        },
      },
    });

    expect(task).toBeTruthy();

    const response = await signPublicCloudMou(requests.create.licencePlate, {
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
            licencePlate: requests.create.licencePlate,
          },
        },
      },
    });

    expect(task).toBeTruthy();

    const response = await reviewPublicCloudMou(requests.create.licencePlate, {
      taskId: task?.id ?? '',
      decision: 'APPROVE',
    });

    expect(response.status).toBe(200);
  });

  it('should successfully approve the request by admin', async () => {
    await mockSessionByRole('admin');

    const response = await makePublicCloudRequestDecision(requests.create.id, {
      ...requests.create.decisionData,
      type: RequestType.CREATE,
      accountCoding: requests.create.decisionData.billing.accountCoding,
      decision: DecisionStatus.APPROVED,
    });

    expect(response.status).toBe(200);
  });

  it('should successfully provision the request', async () => {
    await mockSessionByEmail();

    const response = await provisionPublicCloudProject(requests.create.licencePlate);
    expect(response.status).toBe(200);
  });

  it('should successfully submit a delete request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await deletePublicCloudProject(requests.create.licencePlate);
    expect(response.status).toBe(200);

    requests.delete = await response.json();
    expect(requests.delete.licencePlate).toBe(requests.create.licencePlate);
  });

  it('should fail to submit the same request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await deletePublicCloudProject(requests.delete.licencePlate);
    expect(response.status).toBe(401);
  });

  it('should successfully reject the request by admin', async () => {
    await mockSessionByRole('admin');

    const response = await makePublicCloudRequestDecision(requests.delete.id, {
      ...requests.delete.decisionData,
      type: RequestType.DELETE,
      accountCoding: requests.delete.decisionData.billing.accountCoding,
      decision: DecisionStatus.REJECTED,
    });

    expect(response.status).toBe(200);
  });

  it('should successfully submit a delete request for admin', async () => {
    await mockSessionByRole('admin');

    const response = await deletePublicCloudProject(requests.delete.licencePlate);
    expect(response.status).toBe(200);

    requests.delete = await response.json();
    expect(requests.delete.licencePlate).toBe(requests.create.licencePlate);
  });

  it('should fail to submit the same request for admin', async () => {
    await mockSessionByRole('admin');

    const response = await deletePublicCloudProject(requests.delete.licencePlate);
    expect(response.status).toBe(401);
  });

  it('should successfully reject the request by admin', async () => {
    await mockSessionByRole('admin');

    const response = await makePublicCloudRequestDecision(requests.delete.id, {
      ...requests.delete.decisionData,
      type: RequestType.DELETE,
      accountCoding: requests.delete.decisionData.billing.accountCoding,
      decision: DecisionStatus.REJECTED,
    });

    expect(response.status).toBe(200);
  });

  it('should fail to submit a delete request for a non-assigned user', async () => {
    const otherUsers = findOtherMockUsers([
      productData.main.projectOwner.email,
      productData.main.primaryTechnicalLead.email,
      productData.main.secondaryTechnicalLead.email,
    ]);

    await mockSessionByEmail(otherUsers[0].email);

    const response = await deletePublicCloudProject(requests.delete.licencePlate);
    expect(response.status).toBe(401);
  });

  it('should fail to submit a delete request for unauthenticated user', async () => {
    await mockSessionByEmail();

    const requestData = createSamplePublicCloudProductData();
    const response = await createPublicCloudProject(requestData);
    expect(response.status).toBe(401);
  });
});
