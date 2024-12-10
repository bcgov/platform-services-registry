import { expect } from '@jest/globals';
import { DecisionStatus, Cluster, RequestType } from '@prisma/client';
import { GlobalRole } from '@/constants';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { resourceRequests1, resourceRequests2 } from '@/helpers/mock-resources/private-cloud-product';
import { pickProductData } from '@/helpers/product';
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
  'resourceRequests',
  'commonComponents',
];

const productData = {
  main: createSamplePrivateCloudProductData({
    data: {
      resourceRequests: resourceRequests1,
    },
  }),
};

const requests: any = { main: null };

async function makeBasicProductReview(decision: DecisionStatus, extra = {}) {
  const decisionData = requests.main.decisionData;
  const response = await makePrivateCloudRequestDecision(requests.main.id, {
    type: RequestType.CREATE,
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

    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should fail to review the create request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should successfully review the create request for global admin', async () => {
    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(
      pickProductData(requests.main.decisionData, fieldsToCompare),
    );
  });

  it('should fail to review the create request already reviewed', async () => {
    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

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
      resourceRequests: resourceRequests2,
    });

    expect(response.status).toBe(200);

    requests.main = await response.json();
  });

  it('should fail to review the update request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should fail to review the update request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should successfully review the update request for global admin', async () => {
    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(decisionData.resourceRequests).toEqual(decisionData.resourceRequests);
  });

  it('should fail to review the update request already reviewed', async () => {
    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

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

    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should fail to review the delete request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should successfully review the delete request for global admin', async () => {
    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(200);
  });

  it('should fail to review the delete request already reviewed', async () => {
    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

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
    await mockSessionByRole(GlobalRole.PrivateReviewer);
    const requestData = requests.main;

    const newName = requestData.decisionData.name + '_suffix';
    const newCluster = requestData.decisionData.cluster === Cluster.SILVER ? Cluster.EMERALD : Cluster.SILVER;

    const response = await makeBasicProductReview(DecisionStatus.APPROVED, {
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
