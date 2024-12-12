import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import { createSamplePrivateCloudCommentData } from '@/helpers/mock-resources';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import {
  createPrivateCloudComment,
  updatePrivateCloudComment,
  getPrivateCloudComment,
} from '@/services/api-test/private-cloud/products';
import { generateShortId } from '@/utils/js';

let licencePlate: string;
let commentId: string;

describe('Update Private Cloud Comment - Permissions', () => {
  beforeAll(async () => {
    await mockSessionByRole(GlobalRole.Admin);

    licencePlate = 'test-licence-plate';
    const commentData = createSamplePrivateCloudCommentData({
      data: {
        project: { connect: { id: generateShortId() } },
        request: undefined,
      },
    });

    const createResponse = await createPrivateCloudComment(licencePlate, commentData);
    const createResponseBody = await createResponse.json();

    commentId = createResponseBody.id;

    expect(createResponse.status).toBe(201);
    expect(commentId).toBeDefined();
  });

  it('should return 401 for unauthenticated user', async () => {
    await mockSessionByEmail();

    const response = await updatePrivateCloudComment(licencePlate, commentId, { text: 'Updated text' });

    expect(response.status).toBe(401);
  });

  it('should successfully update a comment for admin', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const updateResponse = await updatePrivateCloudComment(licencePlate, commentId, { text: 'Updated text' });

    expect(updateResponse.status).toBe(200);

    const fetchResponse = await getPrivateCloudComment(licencePlate, commentId);
    const fetchResponseBody = await fetchResponse.json();
    expect(fetchResponseBody.text).toBe('Updated text');
  });

  it('should successfully update a comment for private-admin', async () => {
    const commentData = createSamplePrivateCloudCommentData({
      data: {
        project: { connect: { id: generateShortId() } },
        request: undefined,
      },
    });

    const createResponse = await createPrivateCloudComment(licencePlate, commentData);
    const createResponseBody = await createResponse.json();
    const newCommentId = createResponseBody.id;

    await mockSessionByRole(GlobalRole.PrivateAdmin);

    const updateResponse = await updatePrivateCloudComment(licencePlate, newCommentId, {
      text: 'Private Admin Update',
    });

    expect(updateResponse.status).toBe(200);

    const fetchResponse = await getPrivateCloudComment(licencePlate, newCommentId);
    const fetchResponseBody = await fetchResponse.json();
    expect(fetchResponseBody.text).toBe('Private Admin Update');
  });

  it('should return 401 for users with insufficient permissions', async () => {
    const commentData = createSamplePrivateCloudCommentData({
      data: {
        project: { connect: { id: generateShortId() } },
        request: undefined,
      },
    });

    const createResponse = await createPrivateCloudComment(licencePlate, commentData);
    const createResponseBody = await createResponse.json();
    const anotherCommentId = createResponseBody.id;

    await mockSessionByRole(GlobalRole.Reader);

    const updateResponse = await updatePrivateCloudComment(licencePlate, anotherCommentId, {
      text: 'Reader Update Attempt',
    });

    expect(updateResponse.status).toBe(401);
  });
});

describe('Update Private Cloud Comment - Validations', () => {
  it('should return 400 Bad Request if no text is provided', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const updateResponse = await updatePrivateCloudComment(licencePlate, commentId, { text: '' });

    expect(updateResponse.status).toBe(400);
  });

  it('should return 404 or 500 when attempting to update a comment that does not exist', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const nonExistentCommentId = generateShortId();

    const updateResponse = await updatePrivateCloudComment(licencePlate, nonExistentCommentId, {
      text: 'Non-existent Update',
    });

    expect([404, 500]).toContain(updateResponse.status);
  });
});
