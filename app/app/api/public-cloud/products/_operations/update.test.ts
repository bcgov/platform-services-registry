import { expect } from '@jest/globals';
import { DecisionStatus, Provider, TaskType, TaskStatus, RequestType } from '@prisma/client';
import { GlobalRole } from '@/constants';
import { defaultAccountCoding } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { findOtherMockUsers } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { mockTeamServiceAccount } from '@/services/api-test/core';
import {
  createPublicCloudProduct,
  editPublicCloudProduct,
  signPublicCloudBilling,
  reviewPublicCloudBilling,
} from '@/services/api-test/public-cloud/products';
import { makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';
import { provisionPublicCloudProduct } from '@/services/api-test/v1/public-cloud';

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
  const response = await editPublicCloudProduct(requests.create.licencePlate, {
    ...requests.create.decisionData,
    environmentsEnabled: newEnvironmentsEnabled,
    isAgMinistryChecked: true,
    ...extra,
  });

  return response;
}

// TODO: add tests for ministry roles
// TODO: test the emails templates if possible
describe('Update Public Cloud Product - Permissions', () => {
  it('should successfully submit a create request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await createPublicCloudProduct(productData.main);
    expect(response.status).toBe(200);

    requests.create = await response.json();
  });

  it('should successfully sign the billing by EA', async () => {
    await mockSessionByEmail(requests.create.decisionData.expenseAuthority.email);

    const billing = await prisma.publicCloudBilling.findFirst({
      where: { licencePlate: requests.create.licencePlate, signed: false, approved: false },
    });
    expect(billing).toBeTruthy();
    if (!billing) return;

    const response = await signPublicCloudBilling(requests.create.licencePlate, billing.id, {
      accountCoding: defaultAccountCoding,
      confirmed: true,
    });

    expect(response.status).toBe(200);
  });

  it('should successfully review the billing by billing reviewer', async () => {
    const billing = await prisma.publicCloudBilling.findFirst({
      where: { licencePlate: requests.create.licencePlate, signed: true, approved: false },
    });
    expect(billing).toBeTruthy();
    if (!billing) return;

    await mockSessionByRole(GlobalRole.BillingReviewer);
    const response = await reviewPublicCloudBilling(requests.create.licencePlate, billing.id, {
      decision: 'APPROVE',
    });

    expect(response.status).toBe(200);
  });

  it('should successfully approve the request by admin', async () => {
    await mockSessionByRole(GlobalRole.PublicReviewer);

    const response = await makePublicCloudRequestDecision(requests.create.id, {
      ...requests.create.decisionData,
      type: RequestType.CREATE,
      decision: DecisionStatus.APPROVED,
    });

    expect(response.status).toBe(200);
  });

  it('should successfully provision the request', async () => {
    await mockTeamServiceAccount(['public-admin']);

    const response = await provisionPublicCloudProduct(requests.create.licencePlate);
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
    await mockSessionByRole(GlobalRole.Admin);

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
    await mockTeamServiceAccount(['public-admin']);

    const response = await provisionPublicCloudProduct(requests.update.licencePlate);
    expect(response.status).toBe(200);
  });
});

describe('Update Public Cloud Product - Validations', () => {
  it('should fail to submit a update request due to an invalid name property', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await makeBasicProductChange({ name: '' });

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'name')).not.toBeUndefined();
  });

  it('should fail to submit a update request due to an invalid description property', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await makeBasicProductChange({ description: '' });

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'description')).not.toBeUndefined();
  });

  it('should fail to submit a update request due to an invalid provider property', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await makeBasicProductChange({ provider: 'INVALID' });

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'provider')).not.toBeUndefined();
  });

  it('should ignore the provider change on a new update request', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const newProvider = requests.create.decisionData.provider === Provider.AWS ? Provider.AZURE : Provider.AWS;

    const response = await makeBasicProductChange({ provider: newProvider });

    expect(response.status).toBe(200);

    requests.update = await response.json();
    expect(requests.update.licencePlate).toBe(requests.create.licencePlate);
    expect(requests.update.decisionData.provider).not.toBe(newProvider);
  });

  it('should fail to submit a update request due to an invalid ministry property', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await makeBasicProductChange({ ministry: 'INVALID' });

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'ministry')).not.toBeUndefined();
  });

  it('should fail to submit a update request due to an invalid projectOwner property', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await makeBasicProductChange({ projectOwnerId: null, projectOwner: null });
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(
      resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'projectOwnerId'),
    ).not.toBeUndefined();
  });

  it('should fail to submit a update request due to an invalid primaryTechnicalLead property', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await makeBasicProductChange({ primaryTechnicalLeadId: null, primaryTechnicalLead: null });
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(
      resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'primaryTechnicalLeadId'),
    ).not.toBeUndefined();
  });

  it('should successfully provision the request', async () => {
    await mockTeamServiceAccount(['public-admin']);

    const response = await provisionPublicCloudProduct(requests.create.licencePlate);
    expect(response.status).toBe(200);
  });

  it('should successfully create a request without an secondaryTechnicalLead property', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await makeBasicProductChange({ secondaryTechnicalLeadId: null });
    expect(response.status).toBe(200);
  });
});
