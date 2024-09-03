import { expect } from '@jest/globals';
import { $Enums } from '@prisma/client';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { provisionPrivateCloudProject } from '@/services/api-test/private-cloud';
import {
  createPrivateCloudProject,
  getPrivateCloudProject,
  createPrivateCloudComment,
  getAllPrivateCloudComments,
} from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';

let globalLicencePlate: string;
const globalProductData = createSamplePrivateCloudProductData();

const requests = {
  create: null as any,
};

describe('Private Cloud Comments - Permissions', () => {
  it('should successfully submit a create request for PO', async () => {
    await mockSessionByEmail(globalProductData.projectOwner.email);

    const response = await createPrivateCloudProject(globalProductData);
    expect(response.status).toBe(200);

    requests.create = await response.json();
    globalLicencePlate = requests.create.licencePlate;
  });

  it('should successfully approve the request by admin', async () => {
    await mockSessionByRole('admin');

    const response = await makePrivateCloudRequestDecision(requests.create.id, {
      ...requests.create.decisionData,
      decision: $Enums.DecisionStatus.APPROVED,
    });

    expect(response.status).toBe(200);
  });

  it('should successfully provision the request', async () => {
    await mockSessionByEmail();

    const response = await provisionPrivateCloudProject(globalLicencePlate);
    expect(response.status).toBe(200);
  });

  it('should successfully create comments', async () => {
    await mockSessionByRole('admin');
    const projectResponse = await getPrivateCloudProject(globalLicencePlate);
    const projectData = await projectResponse.json();
    const activeProjectId = projectData?.id;

    const adminUserId = globalProductData.projectOwner.id;

    const commentData1 = {
      text: 'This is the first comment',
      userId: adminUserId,
      projectId: activeProjectId,
    };

    const commentData2 = {
      text: 'This is the second comment',
      userId: adminUserId,
      projectId: activeProjectId,
    };

    const commentResponse1 = await createPrivateCloudComment(globalLicencePlate, commentData1);
    expect(commentResponse1.status).toBe(201);

    const commentResponse2 = await createPrivateCloudComment(globalLicencePlate, commentData2);
    expect(commentResponse2.status).toBe(201);
  });

  it('should return 401 for unauthenticated user', async () => {
    await mockSessionByEmail();

    const response = await getAllPrivateCloudComments(globalLicencePlate);
    expect(response.status).toBe(401);
  });

  it('should successfully list comments for admin', async () => {
    await mockSessionByRole('admin');

    const response = await getAllPrivateCloudComments(globalLicencePlate);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(2);
  });

  it('should successfully list comments for private-admin', async () => {
    await mockSessionByRole('private-admin');

    const response = await getAllPrivateCloudComments(globalLicencePlate);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(2);
  });

  it('should return 401 for users with insufficient permissions', async () => {
    await mockSessionByRole('reader');

    const response = await getAllPrivateCloudComments(globalLicencePlate);

    expect(response.status).toBe(401);
  });
});

describe('Private Cloud Comments - Validations', () => {
  let localLicencePlate: string;
  let activeProjectId: string;

  it('should successfully create, approve, and provision a project', async () => {
    await mockSessionByRole('admin');
    const productData = createSamplePrivateCloudProductData();

    const createResponse = await createPrivateCloudProject(productData);
    expect(createResponse.status).toBe(200);
    const createResponseBody = await createResponse.json();
    localLicencePlate = createResponseBody.licencePlate;
    activeProjectId = createResponseBody.id;

    const approveResponse = await makePrivateCloudRequestDecision(activeProjectId, {
      ...createResponseBody.decisionData,
      decision: $Enums.DecisionStatus.APPROVED,
    });
    expect(approveResponse.status).toBe(200);

    const provisionResponse = await provisionPrivateCloudProject(localLicencePlate);
    expect(provisionResponse.status).toBe(200);
  });

  it('should return 404 if the project is not found by licencePlate', async () => {
    await mockSessionByRole('admin');

    const nonExistentLicencePlate = 'non-existent-plate';
    const response = await getAllPrivateCloudComments(nonExistentLicencePlate);

    expect(response.status).toBe(500);
  });

  it('should return an empty array if no comments exist for the provided licencePlate', async () => {
    await mockSessionByRole('admin');

    const response = await getAllPrivateCloudComments(localLicencePlate);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});
