import { expect } from '@jest/globals';
import { DecisionStatus, RequestType } from '@prisma/client';
import { GlobalRole } from '@/constants';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { findOtherMockUsers } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPrivateCloudProject } from '@/services/api-test/private-cloud';
import { createPrivateCloudProject, deletePrivateCloudProject } from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';

const productData = {
  main: createSamplePrivateCloudProductData(),
};

const requests = {
  create: null as any,
  delete: null as any,
};

// TODO: add tests for ministry roles
describe('Delete Private Cloud Product - Permissions', () => {
  it('should successfully submit a create request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await createPrivateCloudProject(productData.main);
    expect(response.status).toBe(200);

    requests.create = await response.json();
  });

  it('should successfully approve the request by admin', async () => {
    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const response = await makePrivateCloudRequestDecision(requests.create.id, {
      ...requests.create.decisionData,
      type: RequestType.CREATE,
      decision: DecisionStatus.APPROVED,
    });

    expect(response.status).toBe(200);
  });

  it('should successfully provision the request', async () => {
    await mockSessionByEmail();

    const response = await provisionPrivateCloudProject(requests.create.licencePlate);
    expect(response.status).toBe(200);
  });

  it('should successfully submit a delete request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await deletePrivateCloudProject(requests.create.licencePlate);
    expect(response.status).toBe(200);

    requests.delete = await response.json();
    expect(requests.delete.licencePlate).toBe(requests.create.licencePlate);
  });

  it('should fail to submit the same request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await deletePrivateCloudProject(requests.delete.licencePlate);
    expect(response.status).toBe(401);
  });

  it('should successfully reject the request by admin', async () => {
    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const response = await makePrivateCloudRequestDecision(requests.delete.id, {
      ...requests.delete.decisionData,
      type: RequestType.DELETE,
      decision: DecisionStatus.REJECTED,
    });

    expect(response.status).toBe(200);
  });

  it('should successfully submit a delete request for admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await deletePrivateCloudProject(requests.delete.licencePlate);
    expect(response.status).toBe(200);

    requests.delete = await response.json();
    expect(requests.delete.licencePlate).toBe(requests.create.licencePlate);
  });

  it('should fail to submit the same request for admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await deletePrivateCloudProject(requests.delete.licencePlate);
    expect(response.status).toBe(401);
  });

  it('should successfully reject the request by admin', async () => {
    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const response = await makePrivateCloudRequestDecision(requests.delete.id, {
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

    const response = await deletePrivateCloudProject(requests.delete.licencePlate);
    expect(response.status).toBe(401);
  });

  it('should fail to submit a delete request for unauthenticated user', async () => {
    await mockSessionByEmail();

    const requestData = createSamplePrivateCloudProductData();
    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(401);
  });
});
