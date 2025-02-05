import { expect } from '@jest/globals';
import { Ministry, Provider } from '@prisma/client';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { findOtherMockUsers, mockNoRoleUsers, upsertMockUser } from '@/helpers/mock-users';
import { pickProductData } from '@/helpers/product';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { createPublicCloudProject } from '@/services/api-test/public-cloud/products';

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

const memberData = {
  projectOwner: PO,
  primaryTechnicalLead: TL1,
  secondaryTechnicalLead: TL2,
  expenseAuthority: EA,
};

// Create users in advance before running tests
beforeAll(async () => {
  await Promise.all([PO, TL1, TL2, EA].map((user) => upsertMockUser(user)));

  const [createdPO, createdTL1, createdTL2, createdEA] = await Promise.all([
    prisma.user.findUnique({ where: { email: PO.email } }),
    prisma.user.findUnique({ where: { email: TL1.email } }),
    prisma.user.findUnique({ where: { email: TL2.email } }),
    prisma.user.findUnique({ where: { email: EA.email } }),
  ]);

  memberData.projectOwner.id = createdPO!.id;
  memberData.primaryTechnicalLead.id = createdTL1!.id;
  memberData.secondaryTechnicalLead.id = createdTL2!.id;
  memberData.expenseAuthority.id = createdEA!.id;
});

// TODO: add tests for ministry roles
// TODO: test the emails templates if possible
describe('Create Public Cloud Product - Permissions', () => {
  it('should return 401 for unauthenticated user', async () => {
    await mockSessionByEmail();

    const requestData = createSamplePublicCloudProductData();
    const response = await createPublicCloudProject(requestData);
    expect(response.status).toBe(401);
  });

  it('should successfully submit a create request for PO', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByEmail(requestData.projectOwner.email);

    const response = await createPublicCloudProject(requestData);
    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestData, fieldsToCompare));
  });

  it('should successfully submit a create request for TL1', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByEmail(requestData.primaryTechnicalLead.email);

    const response = await createPublicCloudProject(requestData);
    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestData, fieldsToCompare));
  });

  it('should successfully submit a create request for TL2', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByEmail(requestData.secondaryTechnicalLead.email);

    const response = await createPublicCloudProject(requestData);
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

    const response = await createPublicCloudProject(requestData);
    expect(response.status).toBe(401);
  });

  it('should successfully submit a create request for global admin', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.Admin);

    const response = await createPublicCloudProject(requestData);
    expect(response.status).toBe(200);

    const resData = await response.json();
    const decisionData = resData.decisionData;

    expect(pickProductData(decisionData, fieldsToCompare)).toEqual(pickProductData(requestData, fieldsToCompare));
  });

  it('should fail to submit a create request for global reader', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.Reader);

    const response = await createPublicCloudProject(requestData);
    expect(response.status).toBe(401);
  });

  it('should successfully submit a create request for public admin', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.PublicAdmin);

    const response = await createPublicCloudProject(requestData);
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

    const response = await createPublicCloudProject(requestData);
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

    const response = await createPublicCloudProject(requestData);
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

    const response = await createPublicCloudProject(requestData);
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

    const response = await createPublicCloudProject(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'ministry')).not.toBeUndefined();
  });

  it('should fail to submit a create request due to an invalid projectOwner property', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.projectOwner = null as any;

    const response = await createPublicCloudProject(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'projectOwner')).not.toBeUndefined();
  });

  it('should fail to submit a create request due to an invalid primaryTechnicalLead property', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.primaryTechnicalLead = null as any;

    const response = await createPublicCloudProject(requestData);
    expect(response.status).toBe(400);

    const resData = await response.json();
    expect(resData.success).toBe(false);
    expect(resData.message).toBe('Bad Request');
    expect(
      resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'primaryTechnicalLead'),
    ).not.toBeUndefined();
  });

  it('should successfully create a request without an secondaryTechnicalLead property', async () => {
    const requestData = createSamplePublicCloudProductData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.secondaryTechnicalLead = null as any;

    const response = await createPublicCloudProject(requestData);
    expect(response.status).toBe(200);
  });
});
