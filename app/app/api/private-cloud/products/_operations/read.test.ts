import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { findOtherMockUsers } from '@/helpers/mock-users';
import { pickProductData } from '@/helpers/product';
import { DecisionStatus, RequestType } from '@/prisma/client';
import { mockSessionByIdirGuid, mockSessionByRole } from '@/services/api-test/core';
import { mockTeamServiceAccount } from '@/services/api-test/core';
import { createPrivateCloudProduct, getPrivateCloudProduct } from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';
import { provisionPrivateCloudProduct } from '@/services/api-test/v1/private-cloud';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';

const fieldsToCompare = [
  'name',
  'description',
  'cluster',
  'projectOwner',
  'primaryTechnicalLead',
  'secondaryTechnicalLead',
];

const productData = {
  main: createSamplePrivateCloudProductData(),
};

const requests = {
  create: {} as unknown as PrivateCloudRequestDetailDecorated,
};

describe('Read Private Cloud Product - Permissions', () => {
  it('should successfully submit a create request for PO', async () => {
    await mockSessionByIdirGuid(productData.main.projectOwner.idirGuid);

    const response = await createPrivateCloudProduct(productData.main);
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
    await mockTeamServiceAccount(['private-admin']);

    const response = await provisionPrivateCloudProduct(requests.create.licencePlate);
    expect(response.status).toBe(200);
  });

  it('should return 401 for unauthenticated user', async () => {
    await mockSessionByIdirGuid();

    const response = await getPrivateCloudProduct(requests.create.decisionData.licencePlate);

    expect(response.status).toBe(401);
  });

  it('should successfully read the product for admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await getPrivateCloudProduct(requests.create.decisionData.licencePlate);

    expect(response.status).toBe(200);

    const resData = await response.json();
    expect(pickProductData(resData, fieldsToCompare)).toEqual(
      pickProductData(requests.create.decisionData, fieldsToCompare),
    );
  });

  it('should successfully read the product for PO', async () => {
    await mockSessionByIdirGuid(productData.main.projectOwner.idirGuid);

    const response = await getPrivateCloudProduct(requests.create.decisionData.licencePlate);

    expect(response.status).toBe(200);

    const resData = await response.json();
    expect(pickProductData(resData, fieldsToCompare)).toEqual(
      pickProductData(requests.create.decisionData, fieldsToCompare),
    );
  });

  it('should successfully read the product for TL1', async () => {
    await mockSessionByIdirGuid(productData.main.primaryTechnicalLead.idirGuid);

    const response = await getPrivateCloudProduct(requests.create.decisionData.licencePlate);

    expect(response.status).toBe(200);

    const resData = await response.json();
    expect(pickProductData(resData, fieldsToCompare)).toEqual(
      pickProductData(requests.create.decisionData, fieldsToCompare),
    );
  });

  it('should successfully read the product for TL2', async () => {
    await mockSessionByIdirGuid(productData.main.secondaryTechnicalLead.idirGuid);

    const response = await getPrivateCloudProduct(requests.create.decisionData.licencePlate);

    expect(response.status).toBe(200);

    const resData = await response.json();
    expect(pickProductData(resData, fieldsToCompare)).toEqual(
      pickProductData(requests.create.decisionData, fieldsToCompare),
    );
  });

  it('should fail to read the product for a non-assigned user', async () => {
    const otherUsers = findOtherMockUsers([
      productData.main.projectOwner.email,
      productData.main.primaryTechnicalLead.email,
      productData.main.secondaryTechnicalLead.email,
    ]);

    await mockSessionByIdirGuid(otherUsers[0].idirGuid);

    const response = await getPrivateCloudProduct(requests.create.decisionData.licencePlate);

    expect(response.status).toBe(401);
  });
});
