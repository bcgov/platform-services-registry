import { expect } from '@jest/globals';
import { DecisionStatus, Cluster, TaskType, TaskStatus, RequestType } from '@prisma/client';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers, upsertMockUser } from '@/helpers/mock-users';
import { pickProductData } from '@/helpers/product';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPublicCloudProject } from '@/services/api-test/public-cloud';
import {
  createPublicCloudProject,
  editPublicCloudProject,
  deletePublicCloudProject,
  signPublicCloudMou,
  reviewPublicCloudMou,
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

const [PO, TL1, TL2, EA] = mockNoRoleUsers;

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

// Create users in advance before running tests
beforeAll(async () => {
  await Promise.all([PO, TL1, TL2, EA].map((user) => upsertMockUser(user)));

  const [createdPO, createdTL1, createdTL2, createdEA] = await Promise.all([
    prisma.user.findUnique({ where: { email: PO.email } }),
    prisma.user.findUnique({ where: { email: TL1.email } }),
    prisma.user.findUnique({ where: { email: TL2.email } }),
    prisma.user.findUnique({ where: { email: EA.email } }),
  ]);

  productData.main.projectOwner.id = createdPO!.id;
  productData.main.primaryTechnicalLead.id = createdTL1!.id;
  productData.main.secondaryTechnicalLead.id = createdTL2!.id;
  productData.main.expenseAuthority.id = createdEA!.id;
});

async function makeBasicProductMouReview() {
  const requestId = requests.main.id;
  const decisionData = requests.main.decisionData;

  const task1 = await prisma.task.findFirst({
    where: {
      type: TaskType.SIGN_PUBLIC_CLOUD_MOU,
      status: TaskStatus.ASSIGNED,
      data: {
        equals: {
          licencePlate: requests.main.licencePlate,
        },
      },
    },
  });

  if (task1) {
    await mockSessionByEmail(decisionData.expenseAuthority.email);
    await signPublicCloudMou(requests.main.licencePlate, {
      taskId: task1?.id ?? '',
      confirmed: true,
    });

    await mockSessionByRole(GlobalRole.BillingReviewer);
    const task2 = await prisma.task.findFirst({
      where: {
        type: TaskType.REVIEW_PUBLIC_CLOUD_MOU,
        status: TaskStatus.ASSIGNED,
        data: {
          equals: {
            licencePlate: requests.main.licencePlate,
          },
        },
      },
    });

    await reviewPublicCloudMou(requests.main.licencePlate, {
      taskId: task2?.id ?? '',
      decision: 'APPROVE',
    });
  }
}

async function makeBasicProductReview(decision: DecisionStatus, extra = {}) {
  const decisionData = requests.main.decisionData;
  const response = await makePublicCloudRequestDecision(requests.main.id, {
    type: RequestType.CREATE,
    ...decisionData,
    ...extra,
    decision,
    accountCoding: decisionData.billing.accountCoding,
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
    await makeBasicProductMouReview();

    await mockSessionByEmail(productData.main.projectOwner.email);
    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should fail to review the create request for TL1', async () => {
    await makeBasicProductMouReview();

    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);
    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should successfully review the create request for global admin', async () => {
    await makeBasicProductMouReview();

    await mockSessionByRole(GlobalRole.PublicReviewer);
    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(
      pickProductData(requests.main.decisionData, fieldsToCompare),
    );
  });

  it('should fail to review the create request already reviewed', async () => {
    await makeBasicProductMouReview();

    await mockSessionByRole(GlobalRole.PublicReviewer);
    const response = await makeBasicProductReview(DecisionStatus.APPROVED);
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
      accountCoding: requests.main.decisionData.billing.accountCoding,
      environmentsEnabled: newEnvironmentsEnabled,
      isAgMinistryChecked: true,
    });

    expect(response.status).toBe(200);

    requests.main = await response.json();
  });

  it('should fail to review the update request for PO', async () => {
    await makeBasicProductMouReview();

    await mockSessionByEmail(productData.main.projectOwner.email);
    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should fail to review the update request for TL1', async () => {
    await makeBasicProductMouReview();

    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);
    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should fail to review the update request for global admin', async () => {
    await makeBasicProductMouReview();

    await mockSessionByRole(GlobalRole.PublicReviewer);
    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

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
    await makeBasicProductMouReview();

    await mockSessionByEmail(productData.main.projectOwner.email);
    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should fail to review the delete request for TL1', async () => {
    await makeBasicProductMouReview();

    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);
    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(401);

    const resData = await response.json();
    expect(resData.success).toBe(false);
  });

  it('should successfully review the delete request for global admin', async () => {
    await makeBasicProductMouReview();

    await mockSessionByRole(GlobalRole.PublicReviewer);
    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

    expect(response.status).toBe(200);
  });

  it('should fail to review the delete request already reviewed', async () => {
    await makeBasicProductMouReview();

    await mockSessionByRole(GlobalRole.PublicReviewer);
    const response = await makeBasicProductReview(DecisionStatus.APPROVED);

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
    const requestData = requests.main;

    const newName = requestData.decisionData.name + '_suffix';
    const newCluster = requestData.decisionData.cluster === Cluster.SILVER ? Cluster.EMERALD : Cluster.SILVER;

    await makeBasicProductMouReview();

    await mockSessionByRole(GlobalRole.PublicReviewer);
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
