import { expect } from '@jest/globals';
import { DecisionStatus, RequestType } from '@prisma/client';
import { GlobalRole } from '@/constants';
import { defaultAccountCoding } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { findOtherMockUsers } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { mockTeamServiceAccount } from '@/services/api-test/core';
import {
  createPublicCloudProduct,
  deletePublicCloudProduct,
  signPublicCloudBilling,
  reviewPublicCloudBilling,
} from '@/services/api-test/public-cloud/products';
import { makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';
import { provisionPublicCloudProduct } from '@/services/api-test/v1/public-cloud';

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

    const response = await createPublicCloudProduct(productData.main);
    expect(response.status).toBe(200);

    requests.create = await response.json();
  });

  it('should successfully sign the billing by EA', async () => {
    const billing = await prisma.publicCloudBilling.findFirst({
      where: { licencePlate: requests.create.licencePlate, signed: false, approved: false },
    });
    expect(billing).toBeTruthy();
    if (!billing) return;

    await mockSessionByEmail(requests.create.decisionData.expenseAuthority.email);
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

  it('should successfully submit a delete request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await deletePublicCloudProduct(requests.create.licencePlate);
    expect(response.status).toBe(200);

    requests.delete = await response.json();
    expect(requests.delete.licencePlate).toBe(requests.create.licencePlate);
  });

  it('should fail to submit the same request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await deletePublicCloudProduct(requests.delete.licencePlate);
    expect(response.status).toBe(401);
  });

  it('should successfully reject the request by admin', async () => {
    await mockSessionByRole(GlobalRole.PublicReviewer);

    const response = await makePublicCloudRequestDecision(requests.delete.id, {
      ...requests.delete.decisionData,
      type: RequestType.DELETE,
      decision: DecisionStatus.REJECTED,
    });

    expect(response.status).toBe(200);
  });

  it('should successfully submit a delete request for admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await deletePublicCloudProduct(requests.delete.licencePlate);
    expect(response.status).toBe(200);

    requests.delete = await response.json();
    expect(requests.delete.licencePlate).toBe(requests.create.licencePlate);
  });

  it('should fail to submit the same request for admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await deletePublicCloudProduct(requests.delete.licencePlate);
    expect(response.status).toBe(401);
  });

  it('should successfully reject the request by admin', async () => {
    await mockSessionByRole(GlobalRole.PublicReviewer);

    const response = await makePublicCloudRequestDecision(requests.delete.id, {
      ...requests.delete.decisionData,
      type: RequestType.DELETE,
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

    const response = await deletePublicCloudProduct(requests.delete.licencePlate);
    expect(response.status).toBe(401);
  });

  it('should fail to submit a delete request for unauthenticated user', async () => {
    await mockSessionByEmail();

    const requestData = createSamplePublicCloudProductData();
    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(401);
  });
});
