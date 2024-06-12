import { expect } from '@jest/globals';
import { $Enums } from '@prisma/client';
import { createSamplePrivateCloudRequestData } from '@/helpers/mock-resources';
import { pickProductData } from '@/helpers/product';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { createPrivateCloudProject } from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';

const fieldsToCompare = [
  'name',
  'description',
  'cluster',
  'ministry',
  'projectOwner',
  'primaryTechnicalLead',
  'secondaryTechnicalLead',
  'developmentQuota',
  'testQuota',
  'productionQuota',
  'toolsQuota',
  'commonComponents',
];

const productData = {
  main: createSamplePrivateCloudRequestData(),
};

const requests: any = { main: null };

async function makeBasicProductReview(decision: $Enums.DecisionStatus, extra = {}) {
  const decisionData = requests.main.decisionData;
  const response = await makePrivateCloudRequestDecision(requests.main.id, {
    ...decisionData,
    ...extra,
    decision,
  });

  return response;
}

// TODO: add tests for ministry roles
// TODO: test the emails templates if possible
describe('Review Private Cloud Request - Permissions', () => {
  it('should successfully submit a create request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await createPrivateCloudProject(productData.main);
    expect(response.status).toBe(200);

    requests.main = await response.json();
  });

  it('should fail to review the request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should fail to review the request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should successfully review the request for global admin', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(
      pickProductData(requests.main.decisionData, fieldsToCompare),
    );
  });

  it('should fail to review a request already reviewed', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });
});

describe('Review Private Cloud Request - Validations', () => {
  it('should successfully submit a create request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await createPrivateCloudProject(productData.main);
    expect(response.status).toBe(200);

    requests.main = await response.json();
  });

  it('should ignore the cluster change', async () => {
    await mockSessionByRole('admin');
    const requestData = requests.main;

    const newName = requestData.decisionData.name + '_suffix';
    const newCluster =
      requestData.decisionData.cluster === $Enums.Cluster.SILVER ? $Enums.Cluster.EMERALD : $Enums.Cluster.SILVER;

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED, {
      name: newName,
      cluster: newCluster,
    });

    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(decisionData.name).toBe(newName);
    expect(decisionData.cluster).toBe(requestData.decisionData.cluster);
  });
});
