import { expect } from '@jest/globals';
import { $Enums } from '@prisma/client';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { pickProductData } from '@/helpers/product';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import {
  createPublicCloudProject,
  editPublicCloudProject,
  deletePublicCloudProject,
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

const requests: any = { main: null };

async function makeBasicProductReview(decision: $Enums.DecisionStatus, extra = {}) {
  const decisionData = requests.main.decisionData;
  const response = await makePublicCloudRequestDecision(requests.main.id, {
    ...decisionData,
    ...extra,
    decision,
  });

  return response;
}

// TODO: add tests for ministry roles
// TODO: test the emails templates if possible
describe('Review Public Cloud Create Request - Permissions', () => {
  it('should successfully submit a create request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await createPublicCloudProject(productData.main);
    expect(response.status).toBe(200);

    requests.main = await response.json();
  });

  it('should fail to review the create request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should fail to review the create request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should successfully review the create request for global admin', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(
      pickProductData(requests.main.decisionData, fieldsToCompare),
    );
  });

  it('should fail to review the create request already reviewed', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should successfully provision the create request', async () => {
    await mockSessionByEmail();

    const response = await provisionPublicCloudProject(requests.main.licencePlate);
    expect(response.status).toBe(200);
  });
});

describe('Review Public Cloud Update Request - Permissions', () => {
  it('should successfully submit a update request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await editPublicCloudProject(requests.main.licencePlate, {
      ...requests.main.decisionData,
      environmentsEnabled: newEnvironmentsEnabled,
    });
    expect(response.status).toBe(200);

    requests.main = await response.json();
  });

  it('should fail to review the update request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should fail to review the update request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should fail to review the update request for global admin', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should successfully provision the update request', async () => {
    await mockSessionByEmail();

    const response = await provisionPublicCloudProject(requests.main.licencePlate);
    expect(response.status).toBe(200);
  });
});

describe('Review Public Cloud Delete Request - Permissions', () => {
  it('should successfully submit a delete request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await deletePublicCloudProject(requests.main.licencePlate);
    expect(response.status).toBe(200);

    requests.main = await response.json();
  });

  it('should fail to review the delete request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should fail to review the delete request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should successfully review the delete request for global admin', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(200);
  });

  it('should fail to review the delete request already reviewed', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should successfully provision the delete request', async () => {
    await mockSessionByEmail();

    const response = await provisionPublicCloudProject(requests.main.licencePlate);
    expect(response.status).toBe(200);
  });
});

describe('Review Public Cloud Request - Validations', () => {
  it('should successfully submit a create request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await createPublicCloudProject(productData.main);
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
