import { expect } from '@jest/globals';
import { $Enums } from '@prisma/client';
import { createSamplePrivateCloudRequestData } from '@/helpers/mock-resources';
import { findOhterMockUsers } from '@/helpers/mock-users';
import { pickProductData } from '@/helpers/product';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { createPrivateCloudProject } from '@/services/api-test/private-cloud/products';

const fieldsToCompare = [
  'name',
  'description',
  'cluster',
  'ministry',
  'projectOwner',
  'primaryTechnicalLead',
  'secondaryTechnicalLead',
  'commonComponents',
];

// TODO: add tests for ministry roles
// TODO: test the emails templates if possible
describe('Create Private Cloud Request - Permissions', () => {
  it('should return 401 for unauthenticated user', async () => {
    await mockSessionByEmail();

    const requestData = createSamplePrivateCloudRequestData();
    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(401);
  });

  it('should successfully create a request for PO requester', async () => {
    const requestData = createSamplePrivateCloudRequestData();
    await mockSessionByEmail(requestData.projectOwner.email);

    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestData, fieldsToCompare));
  });

  it('should successfully create a request for TL1 requester', async () => {
    const requestData = createSamplePrivateCloudRequestData();
    await mockSessionByEmail(requestData.primaryTechnicalLead.email);

    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestData, fieldsToCompare));
  });

  it('should successfully create a request for TL2 requester', async () => {
    const requestData = createSamplePrivateCloudRequestData();
    await mockSessionByEmail(requestData.secondaryTechnicalLead.email);

    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestData, fieldsToCompare));
  });

  it('should fail to create a request for a non-assigned requester', async () => {
    const requestData = createSamplePrivateCloudRequestData();
    const otherUsers = findOhterMockUsers([
      requestData.projectOwner.email,
      requestData.primaryTechnicalLead.email,
      requestData.secondaryTechnicalLead.email,
    ]);

    await mockSessionByEmail(otherUsers[0].email);

    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(401);
  });

  it('should successfully create a request for global admin requester', async () => {
    const requestData = createSamplePrivateCloudRequestData();
    await mockSessionByRole('admin');

    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestData, fieldsToCompare));
  });

  it('should fail to create a request for global reader requester', async () => {
    const requestData = createSamplePrivateCloudRequestData();
    await mockSessionByRole('reader');

    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(401);
  });

  it('should successfully create a request for private admin requester', async () => {
    const requestData = createSamplePrivateCloudRequestData();
    await mockSessionByRole('private-admin');

    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestData, fieldsToCompare));
  });
});

describe('Create Private Cloud Request - Validations', () => {
  it('should fail to create a request due to an invalid name property', async () => {
    const requestData = createSamplePrivateCloudRequestData();
    await mockSessionByRole('admin');

    requestData.name = '';

    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'name')).not.toBeUndefined();
  });

  it('should fail to create a request due to an invalid description property', async () => {
    const requestData = createSamplePrivateCloudRequestData();
    await mockSessionByRole('admin');

    requestData.description = '';

    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'description')).not.toBeUndefined();
  });

  it('should fail to create a request due to an invalid cluster property', async () => {
    const requestData = createSamplePrivateCloudRequestData();
    await mockSessionByRole('admin');

    requestData.cluster = 'INVALID' as $Enums.Cluster;

    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'cluster')).not.toBeUndefined();
  });

  it('should fail to create a request due to an invalid ministry property', async () => {
    const requestData = createSamplePrivateCloudRequestData();
    await mockSessionByRole('admin');

    requestData.ministry = 'INVALID' as $Enums.Ministry;

    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'ministry')).not.toBeUndefined();
  });

  it('should fail to create a request due to an invalid projectOwner property', async () => {
    const requestData = createSamplePrivateCloudRequestData();
    await mockSessionByRole('admin');

    requestData.projectOwner = null as any;

    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'projectOwner')).not.toBeUndefined();
  });

  it('should fail to create a request due to an invalid primaryTechnicalLead property', async () => {
    const requestData = createSamplePrivateCloudRequestData();
    await mockSessionByRole('admin');

    requestData.primaryTechnicalLead = null as any;

    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(
      resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'primaryTechnicalLead'),
    ).not.toBeUndefined();
  });

  it('should successfully create a request without an secondaryTechnicalLead property', async () => {
    const requestData = createSamplePrivateCloudRequestData();
    await mockSessionByRole('admin');

    requestData.secondaryTechnicalLead = null as any;

    const response = await createPrivateCloudProject(requestData);
    expect(response.status).toBe(200);
  });
});
