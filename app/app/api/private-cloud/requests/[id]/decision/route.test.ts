import { expect } from '@jest/globals';
import { $Enums } from '@prisma/client';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { pickProductData } from '@/helpers/product';
import { QuotaCpuEnum, QuotaMemoryEnum, QuotaStorageEnum } from '@/schema';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPrivateCloudProject } from '@/services/api-test/private-cloud';
import {
  createPrivateCloudProject,
  editPrivateCloudProject,
  deletePrivateCloudProject,
} from '@/services/api-test/private-cloud/products';
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

const oldDevelopmentQuota = {
  cpu: QuotaCpuEnum.enum.CPU_REQUEST_1_LIMIT_2,
  memory: QuotaMemoryEnum.enum.MEMORY_REQUEST_4_LIMIT_8,
  storage: QuotaStorageEnum.enum.STORAGE_2,
};

const newDevelopmentQuota = {
  cpu: QuotaCpuEnum.enum.CPU_REQUEST_1_LIMIT_2,
  memory: QuotaMemoryEnum.enum.MEMORY_REQUEST_4_LIMIT_8,
  storage: QuotaStorageEnum.enum.STORAGE_2,
};

const productData = {
  main: createSamplePrivateCloudProductData({
    data: {
      developmentQuota: oldDevelopmentQuota,
    },
  }),
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
describe('Review Private Cloud Create Request - Permissions', () => {
  it('should successfully submit a create request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await createPrivateCloudProject(productData.main);
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

    const response = await provisionPrivateCloudProject(requests.main.licencePlate);
    expect(response.status).toBe(200);
  });
});

describe('Review Private Cloud Update Request - Permissions', () => {
  it('should successfully submit a update request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await editPrivateCloudProject(requests.main.licencePlate, {
      ...requests.main.decisionData,
      developmentQuota: newDevelopmentQuota,
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

  it('should successfully review the update request for global admin', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(decisionData.developmentQuota).toEqual(decisionData.developmentQuota);
  });

  it('should fail to review the update request already reviewed', async () => {
    await mockSessionByRole('admin');

    const response = await makeBasicProductReview($Enums.DecisionStatus.APPROVED);

    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should successfully provision the update request', async () => {
    await mockSessionByEmail();

    const response = await provisionPrivateCloudProject(requests.main.licencePlate);
    expect(response.status).toBe(200);
  });
});

describe('Review Private Cloud Delete Request - Permissions', () => {
  it('should successfully submit a delete request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await deletePrivateCloudProject(requests.main.licencePlate);
    const responseData = await response.json();
    expect(response.status).toBe(200);

    requests.main = responseData;
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

    const response = await provisionPrivateCloudProject(requests.main.licencePlate);
    expect(response.status).toBe(200);
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
