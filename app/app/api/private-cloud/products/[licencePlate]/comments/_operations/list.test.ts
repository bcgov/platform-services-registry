import { expect } from '@jest/globals';
import { createSamplePrivateCloudCommentData, createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import {
  createPrivateCloudComment,
  createPrivateCloudProject,
  getAllPrivateCloudComments,
  getPrivateCloudProject,
} from '@/services/api-test/private-cloud/products';
import { generateShortId } from '@/utils/uuid';

let licencePlate: string;
let projectId: string;

describe('List Private Cloud Comments - Permissions', () => {
  beforeAll(async () => {
    console.log('Setting up admin session');
    await mockSessionByRole('admin'); // Ensure session setup with admin role

    licencePlate = 'test-licence-plate';

    // Create the project associated with the licencePlate
    const productData = createSamplePrivateCloudProductData({
      data: {
        licencePlate: licencePlate,
        name: 'Test Project',
      },
    });

    const projectResponse = await createPrivateCloudProject(productData);
    const projectResponseBody = await projectResponse.json();
    projectId = projectResponseBody.id;

    console.log('Created project with:', { licencePlate, projectId });

    const commentData1 = createSamplePrivateCloudCommentData({
      data: {
        project: { connect: { id: projectId } }, // Use the correct projectId
        text: 'First comment text',
      },
    });

    const commentData2 = createSamplePrivateCloudCommentData({
      data: {
        project: { connect: { id: projectId } }, // Use the correct projectId
        text: 'Second comment text',
      },
    });

    console.log('Creating comments for project:', { commentData1, commentData2 });

    await createPrivateCloudComment(licencePlate, commentData1);
    await createPrivateCloudComment(licencePlate, commentData2);

    // Ensure the correct session is active before making subsequent checks
    console.log('Re-authenticating as admin');
    await mockSessionByRole('admin'); // Re-authenticate as admin to ensure session is active

    // Manually verify the project creation using the same session
    const projectCheckResponse = await getAllPrivateCloudComments(licencePlate);
    const projectCheckResponseBody = await projectCheckResponse.json();

    console.log('Queried project after creation:', {
      status: projectCheckResponse.status,
      projectCheckResponseBody,
    });

    if (projectCheckResponse.status !== 200) {
      throw new Error('Project verification failed');
    }
  });

  it('should return 401 for unauthenticated user', async () => {
    await mockSessionByEmail(); // Setting up a session without authentication

    const response = await getAllPrivateCloudComments(licencePlate);

    console.log('Response for unauthenticated user:', { status: response.status });

    expect(response.status).toBe(401);
  });

  it('should successfully list comments for admin', async () => {
    console.log('Re-authenticating as admin');
    await mockSessionByRole('admin'); // Re-authenticate as admin

    const response = await getAllPrivateCloudComments(licencePlate);
    const responseBody = await response.json();

    console.log('Response for admin:', { status: response.status, responseBody });

    expect(response.status).toBe(200);
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);
  });

  it('should successfully list comments for private-admin', async () => {
    await mockSessionByRole('private-admin'); // Re-authenticate as private-admin

    const response = await getAllPrivateCloudComments(licencePlate);
    const responseBody = await response.json();

    console.log('Response for private-admin:', { status: response.status, responseBody });

    expect(response.status).toBe(200);
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBeGreaterThan(0);
  });

  it('should return 401 for users with insufficient permissions', async () => {
    await mockSessionByRole('reader'); // Authenticate as a reader with insufficient permissions

    const response = await getAllPrivateCloudComments(licencePlate);

    console.log('Response for reader:', { status: response.status });

    expect(response.status).toBe(401);
  });
});

describe('List Private Cloud Comments - Validations', () => {
  it('should return 404 if the project is not found by licencePlate', async () => {
    await mockSessionByRole('admin'); // Re-authenticate as admin

    const nonExistentLicencePlate = 'non-existent-plate';
    const response = await getAllPrivateCloudComments(nonExistentLicencePlate);

    console.log('Response for non-existent licencePlate:', { status: response.status });

    expect(response.status).toBe(404);
  });

  it('should return an empty array if no comments exist for the provided licencePlate', async () => {
    await mockSessionByRole('admin'); // Re-authenticate as admin

    const response = await getAllPrivateCloudComments('no-comments-plate');
    const responseBody = await response.json();

    console.log('Response for no comments:', { status: response.status, responseBody });

    expect(response.status).toBe(200);
    expect(Array.isArray(responseBody)).toBe(true);
    expect(responseBody.length).toBe(0);
  });
});
