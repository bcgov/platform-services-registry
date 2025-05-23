import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import { defaultAccountCoding } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { pickProductData } from '@/helpers/product';
import { DecisionStatus, Cluster, RequestType, Prisma } from '@/prisma/client';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { mockTeamServiceAccount } from '@/services/api-test/core';
import {
  createPublicCloudProduct,
  editPublicCloudProduct,
  deletePublicCloudProduct,
  signPublicCloudBilling,
  reviewPublicCloudBilling,
  getTransformedLeadFields,
} from '@/services/api-test/public-cloud/products';
import { makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';
import { provisionPublicCloudProduct } from '@/services/api-test/v1/public-cloud';
import { PublicCloudRequestDetailDecorated, PublicCloudRequestSimple } from '@/types/public-cloud';

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

const requests = {
  main: {} as unknown as PublicCloudRequestDetailDecorated,
};

function transformLeadFields(
  data: typeof requests.main.decisionData & {
    environmentsEnabled?: any;
    isAgMinistryChecked?: boolean;
  },
) {
  return {
    ...data,
    projectOwner: data.projectOwner ? { id: data.projectOwner.id } : undefined,
    primaryTechnicalLead: data.primaryTechnicalLead ? { id: data.primaryTechnicalLead.id } : undefined,
    secondaryTechnicalLead: data.secondaryTechnicalLead ? { id: data.secondaryTechnicalLead.id } : undefined,
    expenseAuthority: data.expenseAuthority ? { id: data.expenseAuthority.id } : undefined,
  };
}

async function makeBasicProductMouReview() {
  const requestId = requests.main.id;
  const decisionData = requests.main.decisionData;

  const billing = await prisma.publicCloudBilling.findFirst({
    where: { licencePlate: requests.main.licencePlate, signed: false, approved: false },
  });

  if (!billing) return;

  await mockSessionByEmail(decisionData.expenseAuthority.email);
  await signPublicCloudBilling(requests.main.licencePlate, billing.id, {
    accountCoding: defaultAccountCoding,
    confirmed: true,
  });

  await mockSessionByRole(GlobalRole.BillingReviewer);
  const billing2 = await prisma.publicCloudBilling.findFirst({
    where: { licencePlate: requests.main.licencePlate, signed: true, approved: false },
  });

  if (!billing2) return;

  await reviewPublicCloudBilling(requests.main.licencePlate, billing2.id, {
    decision: 'APPROVE',
  });
}

async function makeBasicProductReview(decision: DecisionStatus, extra = {}) {
  const decisionData = requests.main.decisionData;
  const response = await makePublicCloudRequestDecision(requests.main.id, {
    type: RequestType.CREATE,
    ...decisionData,
    ...extra,
    decision: decision as 'APPROVED' | 'REJECTED',
  });

  return response;
}

// TODO: add tests for ministry roles
// TODO: test the emails templates if possible
describe('Review Public Cloud Create Request - Permissions', () => {
  it('should successfully submit a create request for PO', async () => {
    await mockSessionByEmail(productData.main.projectOwner.email);

    const response = await createPublicCloudProduct(productData.main);
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
    await mockTeamServiceAccount(['public-admin']);
    const response = await provisionPublicCloudProduct(requests.main.licencePlate);
    expect(response.status).toBe(200);
  });
});

describe('Review Public Cloud Update Request - Permissions', () => {
  it('should successfully submit a update request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await editPublicCloudProduct(
      requests.main.licencePlate,
      await getTransformedLeadFields({
        ...requests.main.decisionData,
        environmentsEnabled: newEnvironmentsEnabled,
        isAgMinistryChecked: true,
      }),
    );

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
    await mockTeamServiceAccount(['public-admin']);

    const response = await provisionPublicCloudProduct(requests.main.licencePlate);
    expect(response.status).toBe(200);
  });
});

describe('Review Public Cloud Delete Request - Permissions', () => {
  it('should successfully submit a delete request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await deletePublicCloudProduct(requests.main.licencePlate, 'Test delete comment');
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
    await mockTeamServiceAccount(['public-admin']);

    const response = await provisionPublicCloudProduct(requests.main.licencePlate);
    expect(response.status).toBe(200);
  });
});

describe('Review Public Cloud Request - Validations', () => {
  it('should successfully submit a create request for TL1', async () => {
    await mockSessionByEmail(productData.main.primaryTechnicalLead.email);

    const response = await createPublicCloudProduct(productData.main);
    expect(response.status).toBe(200);

    requests.main = await response.json();
  });
});
