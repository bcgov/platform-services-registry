import { expect } from '@jest/globals';
import { DecisionStatus, RequestType } from '@prisma/client';
import prisma from '@/core/prisma';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPrivateCloudProject } from '@/services/api-test/private-cloud';
import { createPrivateCloudProject } from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';

const productData = {
  main: createSamplePrivateCloudProductData(),
};

const requests = {
  create: null as any,
};

describe('Provision Private Cloud Request', () => {
  it('should successfully submit a create request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await createPrivateCloudProject(productData.main);
    expect(response.status).toBe(200);

    requests.create = await response.json();
  });

  it('should successfully approve the request by admin', async () => {
    await mockSessionByRole('admin');

    const response = await makePrivateCloudRequestDecision(requests.create.id, {
      ...requests.create.decisionData,
      type: RequestType.CREATE,
      decision: DecisionStatus.APPROVED,
    });

    expect(response.status).toBe(200);
  });

  it('should have the request decision status as APPROVED', async () => {
    await mockSessionByEmail();

    const request = await prisma.privateCloudRequest.findUnique({
      where: { id: requests.create.id },
      select: { decisionStatus: true },
    });
    expect(request).toBeTruthy();
    expect(request?.decisionStatus).toBe(DecisionStatus.APPROVED);
  });

  it('should successfully provision the request', async () => {
    await mockSessionByEmail();

    const response = await provisionPrivateCloudProject(requests.create.licencePlate);
    expect(response.status).toBe(200);
  });

  it('should have the request decision status as PROVISIONED', async () => {
    await mockSessionByEmail();

    const request = await prisma.privateCloudRequest.findUnique({
      where: { id: requests.create.id },
      select: { decisionStatus: true },
    });

    expect(request).toBeTruthy();
    expect(request?.decisionStatus).toBe(DecisionStatus.PROVISIONED);
  });
});
