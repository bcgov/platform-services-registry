import { expect } from '@jest/globals';
import { $Enums, TaskType, TaskStatus } from '@prisma/client';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { findOtherMockUsers } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import {
  createPublicCloudProject,
  editPublicCloudProject,
  signPublicCloudMou,
  reviewPublicCloudMou,
} from '@/services/api-test/public-cloud/products';
import { makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';

const oldEnvironmentsEnabled = {
  production: true,
  test: false,
  development: false,
  tools: false,
};

const newEnvironmentsEnabled = {
  production: true,
  test: true,
  development: false,
  tools: true,
};

const productData = {
  main: createSamplePublicCloudProductData({
    data: {
      environmentsEnabled: oldEnvironmentsEnabled,
    },
  }),
};

const requests = {
  create: null as any,
  update: null as any,
};

async function makeBasicProductChange(extra = {}) {
  const response = await editPublicCloudProject(requests.create.licencePlate, {
    ...requests.create.decisionData,
    accountCoding: requests.create.decisionData.billing.accountCoding,
    environmentsEnabled: newEnvironmentsEnabled,
    ...extra,
  });

  return response;
}

// TODO: add tests for ministry roles
// TODO: test the emails templates if possible
describe('Update Public Cloud Product - Permissions', () => {
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
      accountCoding: requests.create.decisionData.billing.accountCoding,
      decision: $Enums.DecisionStatus.APPROVED,
    });

    expect(response.status).toBe(200);
  });

  it('should successfully provision the request', async () => {
    await mockSessionByEmail();

    const response = await provisionPublicCloudProject(requests.create.licencePlate);
    expect(response.status).toBe(200);
  });

  it('should successfully submit a update request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await makeBasicProductChange();

    expect(response.status).toBe(200);

    requests.update = await response.json();
    expect(requests.update.licencePlate).toBe(requests.create.licencePlate);
    expect(requests.update.decisionData.environmentsEnabled).toEqual(newEnvironmentsEnabled);
  });

  it('should fail to submit the same request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await makeBasicProductChange();

    expect(response.status).toBe(401);
  });

  it('should fail to submit the same request for admin', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductChange();

    expect(response.status).toBe(401);
  });

  it('should fail to submit a update request for a non-assigned user', async () => {
    const otherUsers = findOtherMockUsers([
      productData.main.projectOwner.email,
      productData.main.primaryTechnicalLead.email,
      productData.main.secondaryTechnicalLead.email,
    ]);

    await mockSessionByEmail(otherUsers[0].email);

    const response = await makeBasicProductChange();

    expect(response.status).toBe(401);
  });

  it('should fail to submit a update request for unauthenticated user', async () => {
    await mockSessionByEmail();

    const response = await makeBasicProductChange();

    expect(response.status).toBe(401);
  });

  it('should successfully provision the request', async () => {
    await mockSessionByEmail();

    const response = await provisionPublicCloudProject(requests.update.licencePlate);
    expect(response.status).toBe(200);
  });
});

describe('Update Public Cloud Product - Validations', () => {
  it('should fail to submit a update request due to an invalid name property', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductChange({ name: '' });

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'name')).not.toBeUndefined();
  });

  it('should fail to submit a update request due to an invalid description property', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductChange({ description: '' });

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'description')).not.toBeUndefined();
  });

  it('should fail to submit a update request due to an invalid provider property', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductChange({ provider: 'INVALID' });

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'provider')).not.toBeUndefined();
  });

  it('should ignore the provider change on a new update request', async () => {
    await mockSessionByRole('admin');

    const newProvider =
      requests.create.decisionData.provider === $Enums.Provider.AWS ? $Enums.Provider.AZURE : $Enums.Provider.AWS;

    const response = await makeBasicProductChange({ provider: newProvider });

    expect(response.status).toBe(200);

    requests.update = await response.json();
    expect(requests.update.licencePlate).toBe(requests.create.licencePlate);
    expect(requests.update.decisionData.provider).not.toBe(newProvider);
  });

  it('should fail to submit a update request due to an invalid ministry property', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductChange({ ministry: 'INVALID' });

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'ministry')).not.toBeUndefined();
  });

  it('should fail to submit a update request due to an invalid projectOwner property', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductChange({ projectOwner: null });

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'projectOwner')).not.toBeUndefined();
  });

  it('should fail to submit a update request due to an invalid primaryTechnicalLead property', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductChange({ primaryTechnicalLead: null });

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(
      resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'primaryTechnicalLead'),
    ).not.toBeUndefined();
  });

  it('should successfully provision the request', async () => {
    await mockSessionByEmail();

    const response = await provisionPublicCloudProject(requests.create.licencePlate);
    expect(response.status).toBe(200);
  });

  it('should successfully create a request without an secondaryTechnicalLead property', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductChange({ secondaryTechnicalLead: null });
    expect(response.status).toBe(200);
  });
});
