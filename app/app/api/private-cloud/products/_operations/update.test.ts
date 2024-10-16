import { expect } from '@jest/globals';
import { DecisionStatus, Cluster, RequestType, CPU, Memory, Storage } from '@prisma/client';
import { GlobalRole } from '@/constants';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { findOtherMockUsers } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPrivateCloudProject } from '@/services/api-test/private-cloud';
import { createPrivateCloudProject, editPrivateCloudProject } from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';

const oldDevelopmentQuota = {
  cpu: CPU.CPU_REQUEST_1_LIMIT_2,
  memory: Memory.MEMORY_REQUEST_4_LIMIT_8,
  storage: Storage.STORAGE_2,
};

const newDevelopmentQuota = {
  cpu: CPU.CPU_REQUEST_1_LIMIT_2,
  memory: Memory.MEMORY_REQUEST_8_LIMIT_16,
  storage: Storage.STORAGE_2,
};

const productData = {
  main: createSamplePrivateCloudProductData({
    data: {
      developmentQuota: oldDevelopmentQuota,
    },
  }),
};

const requests = {
  create: null as any,
  update: null as any,
};

async function makeBasicProductChange(extra = {}) {
  const response = await editPrivateCloudProject(requests.create.licencePlate, {
    ...requests.create.decisionData,
    developmentQuota: newDevelopmentQuota,
    ...extra,
  });

  return response;
}

// TODO: add tests for ministry roles
// TODO: test the emails templates if possible
describe('Update Private Cloud Product - Permissions', () => {
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

  it('should successfully submit a update request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await makeBasicProductChange();

    expect(response.status).toBe(200);

    requests.update = await response.json();
    expect(requests.update.licencePlate).toBe(requests.create.licencePlate);
    expect(requests.update.decisionData.developmentQuota).toEqual(newDevelopmentQuota);
  });

  it('should fail to submit the same request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await makeBasicProductChange();

    expect(response.status).toBe(401);
  });

  it('should successfully reject the request by admin', async () => {
    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const response = await makePrivateCloudRequestDecision(requests.update.id, {
      ...requests.update.decisionData,
      type: RequestType.EDIT,
      decision: DecisionStatus.REJECTED,
    });

    expect(response.status).toBe(200);
  });

  it('should successfully submit a update request for admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await makeBasicProductChange();

    expect(response.status).toBe(200);

    requests.update = await response.json();
    expect(requests.update.licencePlate).toBe(requests.create.licencePlate);
    expect(requests.update.decisionData.developmentQuota).toEqual(newDevelopmentQuota);
  });

  it('should fail to submit the same request for admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await makeBasicProductChange();

    expect(response.status).toBe(401);
  });

  it('should successfully reject the request by admin', async () => {
    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const response = await makePrivateCloudRequestDecision(requests.update.id, {
      ...requests.update.decisionData,
      type: RequestType.EDIT,
      decision: DecisionStatus.REJECTED,
    });

    expect(response.status).toBe(200);
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
});

describe('Update Private Cloud Product - Validations', () => {
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

  it('should fail to submit a update request due to an invalid cluster property', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await makeBasicProductChange({ cluster: 'INVALID' });

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'cluster')).not.toBeUndefined();
  });

  it('should ignore the cluster change on a new update request', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const newCluster = requests.create.decisionData.cluster === Cluster.SILVER ? Cluster.EMERALD : Cluster.SILVER;

    const response = await makeBasicProductChange({ cluster: newCluster });

    expect(response.status).toBe(200);

    requests.update = await response.json();
    expect(requests.update.licencePlate).toBe(requests.create.licencePlate);
    expect(requests.update.decisionData.cluster).not.toBe(newCluster);
  });

  it('should successfully reject the request by admin', async () => {
    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const response = await makePrivateCloudRequestDecision(requests.update.id, {
      ...requests.update.decisionData,
      type: RequestType.EDIT,
      decision: DecisionStatus.REJECTED,
    });

    expect(response.status).toBe(200);
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

    const response = await makeBasicProductChange({ projectOwner: null });

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'projectOwner')).not.toBeUndefined();
  });

  it('should fail to submit a update request due to an invalid primaryTechnicalLead property', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await makeBasicProductChange({ primaryTechnicalLead: null });

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(
      resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'primaryTechnicalLead'),
    ).not.toBeUndefined();
  });

  it('should successfully create a request without an secondaryTechnicalLead property', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await makeBasicProductChange({ secondaryTechnicalLead: null });
    expect(response.status).toBe(200);
  });
});
