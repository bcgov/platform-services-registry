import { expect } from '@jest/globals';
import { $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import { createPublicCloudProject } from '@/services/api-test/public-cloud/products';
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

  it('should successfully approve the request by admin', async () => {
    await mockSessionByRole('admin');

    const response = await makePublicCloudRequestDecision(requests.create.id, {
      ...requests.create.decisionData,
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
