import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { findOtherMockUsers } from '@/helpers/mock-users';
import { pickProductData } from '@/helpers/product';
import { Ministry, Provider } from '@/prisma/types';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { createPublicCloudProduct } from '@/services/api-test/public-cloud/products';

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

// TODO: add tests for ministry roles
// TODO: test the emails templates if possible
describe('Create Public Cloud Product - Permissions', () => {
  it('should return 401 for unauthenticated user', async () => {
    await mockSessionByEmail();

    const requestData = createSamplePublicCloudProductData();
    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(401);
  });

  it('should successfully submit a create request for PO', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByEmail(requestData.projectOwner.email);

    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestData, fieldsToCompare));
  });

  it('should successfully submit a create request for TL1', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByEmail(requestData.primaryTechnicalLead.email);

    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestData, fieldsToCompare));
  });

  it('should successfully submit a create request for TL2', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByEmail(requestData.secondaryTechnicalLead.email);

    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestData, fieldsToCompare));
  });

  it('should fail to submit a create request for a non-assigned user', async () => {
    const requestData = createSamplePublicCloudProductData();
    const otherUsers = findOtherMockUsers([
      requestData.projectOwner.email,
      requestData.primaryTechnicalLead.email,
      requestData.secondaryTechnicalLead.email,
    ]);

    await mockSessionByEmail(otherUsers[0].email);

    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(401);
  });

  it('should successfully submit a create request for global admin', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.Admin);

    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestData, fieldsToCompare));
  });

  it('should fail to submit a create request for global reader', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.Reader);

    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(401);
  });

  it('should successfully submit a create request for public admin', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.PublicAdmin);

    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestData, fieldsToCompare));
  });
});

describe('Create Public Cloud Request - Validations', () => {
  it('should fail to submit a create request due to an invalid name property', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.name = '';

    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'name')).not.toBeUndefined();
  });

  it('should fail to submit a create request due to an invalid description property', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.description = '';

    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'description')).not.toBeUndefined();
  });

  it('should fail to submit a create request due to an invalid provider property', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.provider = 'INVALID' as Provider;

    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'provider')).not.toBeUndefined();
  });

  it('should fail to submit a create request due to an invalid ministry property', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.ministry = 'INVALID' as Ministry;

    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'ministry')).not.toBeUndefined();
  });

  it('should fail to submit a create request due to an invalid projectOwner property', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.projectOwner = undefined;

    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(
      resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'projectOwnerId'),
    ).not.toBeUndefined();
  });

  it('should fail to submit a create request due to an invalid primaryTechnicalLead property', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.primaryTechnicalLead = undefined;

    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(
      resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'primaryTechnicalLeadId'),
    ).not.toBeUndefined();
  });

  it('should successfully create a request without an secondaryTechnicalLead property', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.secondaryTechnicalLead = null as any;

    const response = await createPublicCloudProduct(requestData);
    expect(response.status).toBe(200);
  });
});
