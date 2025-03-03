import { expect } from '@jest/globals';
import { DecisionStatus, TaskType, TaskStatus, RequestType } from '@prisma/client';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import {
  createPublicCloudProject,
  signPublicCloudBilling,
  reviewPublicCloudBilling,
} from '@/services/api-test/public-cloud/products';
import { makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';

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
    const billing = await prisma.publicCloudBilling.findFirst({
      where: { licencePlate: requests.create.licencePlat, signed: false, approved: false },
    });

    expect(billing).toBeTruthy();
    if (!billing) return;

    await mockSessionByEmail(requests.create.decisionData.expenseAuthority.email);
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

  it('should have the request decision status as APPROVED', async () => {
    await mockSessionByEmail();

    const request = await prisma.publicCloudRequest.findUnique({
      where: { id: requests.create.id },
      select: { decisionStatus: true },
    });
    expect(request).toBeTruthy();
    expect(request?.decisionStatus).toBe(DecisionStatus.APPROVED);
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
    expect(request?.decisionStatus).toBe(DecisionStatus.PROVISIONED);
  });
});
