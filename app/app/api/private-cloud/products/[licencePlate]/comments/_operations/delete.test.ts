import { expect } from '@jest/globals';
import { createSamplePrivateCloudCommentData } from '@/helpers/mock-resources';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import {
  createPrivateCloudComment,
  deletePrivateCloudComment,
  getPrivateCloudComment,
} from '@/services/api-test/private-cloud/products';
import { generateShortId } from '@/utils/uuid';

let licencePlate: string;
let commentId: string;

describe('Delete Private Cloud Comment - Permissions', () => {
  beforeAll(async () => {
    await mockSessionByRole('admin');

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

    const response = await deletePrivateCloudComment(licencePlate, commentId);

    expect(response.status).toBe(401);
  });

  it('should successfully delete a comment for admin', async () => {
    await mockSessionByRole('admin');

    const deleteResponse = await deletePrivateCloudComment(licencePlate, commentId);

    expect(deleteResponse.status).toBe(200);

    const fetchResponse = await getPrivateCloudComment(licencePlate, commentId);
    expect(fetchResponse.status).toBe(404);
  });

  it('should successfully delete a comment for private-admin', async () => {
    const commentData = createSamplePrivateCloudCommentData({
      data: {
        project: { connect: { id: generateShortId() } },
        request: undefined,
      },
    });

    const createResponse = await createPrivateCloudComment(licencePlate, commentData);
    const createResponseBody = await createResponse.json();
    const newCommentId = createResponseBody.id;

    await mockSessionByRole('private-admin');

    const deleteResponse = await deletePrivateCloudComment(licencePlate, newCommentId);

    expect(deleteResponse.status).toBe(200);

    const fetchResponse = await getPrivateCloudComment(licencePlate, newCommentId);
    expect(fetchResponse.status).toBe(404);
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

    await mockSessionByRole('reader');

    const deleteResponse = await deletePrivateCloudComment(licencePlate, anotherCommentId);

    expect(deleteResponse.status).toBe(401);
  });
});

describe('Delete Private Cloud Comment - Validations', () => {
  it('should return 500 Bad Request if no comment ID is provided', async () => {
    await mockSessionByRole('admin');

    const deleteResponse = await deletePrivateCloudComment(licencePlate, '');

    expect(deleteResponse.status).toBe(500);
  });

  it('should return 500 when attempting to delete a comment that has already been deleted', async () => {
    await mockSessionByRole('admin');

    const commentData = createSamplePrivateCloudCommentData({
      data: {
        project: { connect: { id: generateShortId() } },
        request: undefined,
      },
    });

    const createResponse = await createPrivateCloudComment(licencePlate, commentData);
    const createResponseBody = await createResponse.json();
    const tempCommentId = createResponseBody.id;

    const deleteResponse1 = await deletePrivateCloudComment(licencePlate, tempCommentId);
    expect(deleteResponse1.status).toBe(200);

    const deleteResponse2 = await deletePrivateCloudComment(licencePlate, tempCommentId);
    expect(deleteResponse2.status).toBe(500);
  });
});
