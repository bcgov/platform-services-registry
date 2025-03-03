import { expect } from '@jest/globals';
import { DecisionStatus, TaskType, TaskStatus, RequestType } from '@prisma/client';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { findOtherMockUsers } from '@/helpers/mock-users';
import { pickProductData } from '@/helpers/product';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import {
  createPublicCloudProject,
  getPublicCloudProject,
  signPublicCloudBilling,
  reviewPublicCloudBilling,
} from '@/services/api-test/public-cloud/products';
import { makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';

const fieldsToCompare = [
  'name',
  'description',
  'provider',
  'ministry',
  'accountCoding',
  'budget',
  'environmentsEnabled',
  'projectOwner',
  'primaryTechnicalLead',
  'secondaryTechnicalLead',
  'expenseAuthority',
];

const productData = {
  main: createSamplePublicCloudProductData(),
};

const requests = {
  create: null as any,
};

// TODO: add tests for ministry roles
describe('Read Public Cloud Product - Permissions', () => {
  it('should successfully submit a create request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await createPublicCloudProject(productData.main);
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
      accountCoding: billing.accountCoding,
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
    await mockSessionByEmail();

    const response = await provisionPublicCloudProject(requests.create.licencePlate);
    expect(response.status).toBe(200);
  });

  it('should return 401 for unauthenticated user', async () => {
    await mockSessionByEmail();

    const response = await getPublicCloudProject(requests.create.decisionData.licencePlate);

    expect(response.status).toBe(401);
  });

  it('should successfully read the product for admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await getPublicCloudProject(requests.create.decisionData.licencePlate);

    expect(response.status).toBe(200);

    const resData = await response.json();
    expect(pickProductData(resData, fieldsToCompare)).toEqual(
      pickProductData(requests.create.decisionData, fieldsToCompare),
    );
  });

  it('should successfully read the product for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await getPublicCloudProject(requests.create.decisionData.licencePlate);

    expect(response.status).toBe(200);

    const resData = await response.json();
    expect(pickProductData(resData, fieldsToCompare)).toEqual(
      pickProductData(requests.create.decisionData, fieldsToCompare),
    );
  });

  it('should successfully read the product for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await getPublicCloudProject(requests.create.decisionData.licencePlate);

    expect(response.status).toBe(200);

    const resData = await response.json();
    expect(pickProductData(resData, fieldsToCompare)).toEqual(
      pickProductData(requests.create.decisionData, fieldsToCompare),
    );
  });

  it('should successfully read the product for TL2', async () => {
    await mockSessionByEmail(productData.main.secondaryTechnicalLead.email);

    const response = await getPublicCloudProject(requests.create.decisionData.licencePlate);

    expect(response.status).toBe(200);

    const resData = await response.json();
    expect(pickProductData(resData, fieldsToCompare)).toEqual(
      pickProductData(requests.create.decisionData, fieldsToCompare),
    );
  });

  it('should fail to read the product for a non-assigned user', async () => {
    const otherUsers = findOtherMockUsers([
      productData.main.projectOwner.email,
      productData.main.primaryTechnicalLead.email,
      productData.main.secondaryTechnicalLead.email,
    ]);

    await mockSessionByEmail(otherUsers[0].email);

    const response = await getPublicCloudProject(requests.create.decisionData.licencePlate);

    expect(response.status).toBe(401);
  });
});
