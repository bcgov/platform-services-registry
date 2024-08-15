import { expect } from '@jest/globals';
import { createSamplePrivateCloudCommentData } from '@/helpers/mock-resources';
import { findOtherMockUsers, generateTestSession } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { createPrivateCloudComment } from '@/services/api-test/private-cloud/products';

describe('Create Private Cloud Comment - Permissions', () => {
  it('should return 401 for unauthenticated user', async () => {
    await mockSessionByEmail();

    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();

    const response = await createPrivateCloudComment(licencePlate, requestData);

    expect(response.status).toBe(401);
  });

  it('should successfully submit a create comment request for admin', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole('admin');

    const response = await createPrivateCloudComment(licencePlate, requestData);

    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody).toEqual(
      expect.objectContaining({
        text: requestData.text,
        userId: expect.any(String),
        projectId: requestData.projectId,
        requestId: requestData.requestId,
      }),
    );
  });

  it('should successfully submit a create comment request for private-admin', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole('private-admin');

    const response = await createPrivateCloudComment(licencePlate, requestData);

    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody).toEqual(
      expect.objectContaining({
        text: requestData.text,
        userId: expect.any(String),
        projectId: requestData.projectId,
        requestId: requestData.requestId,
      }),
    );
  });

  it('should fail to submit a create comment request for a non-assigned user', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    const otherUsers = findOtherMockUsers([requestData.userId]);
    await mockSessionByEmail(otherUsers[0].email);

    const response = await createPrivateCloudComment(licencePlate, requestData);

    expect(response.status).toBe(401);
  });
});

describe('Create Private Cloud Comment - Validations', () => {
  it('should fail to submit a create comment request due to missing text property', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole('admin');

    requestData.text = '';

    const response = await createPrivateCloudComment(licencePlate, requestData);

    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.success).toBe(false);
    expect(responseBody.message).toBe('Bad Request');
    expect(responseBody.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'text')).not.toBeUndefined();
  });

  it('should fail to submit a create comment request due to missing projectId and requestId', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole('admin');

    requestData.projectId = undefined;
    requestData.requestId = undefined;

    const response = await createPrivateCloudComment(licencePlate, requestData);

    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.success).toBe(false);
    expect(responseBody.message).toBe('Bad Request');
    expect(
      responseBody.error.issues.find((iss: { path: string[] }) => ['projectId', 'requestId'].includes(iss.path[0])),
    ).not.toBeUndefined();
  });

  it('should fail to submit a create comment request due to invalid projectId', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole('admin');

    requestData.projectId = 'invalid-object-id';

    const response = await createPrivateCloudComment(licencePlate, requestData);

    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.success).toBe(false);
  });

  it('should fail to submit a create comment request due to invalid requestId', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole('admin');

    requestData.requestId = 'invalid-object-id';

    const response = await createPrivateCloudComment(licencePlate, requestData);

    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.success).toBe(false);
  });

  it('should successfully create a comment with only projectId provided', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole('admin');

    requestData.requestId = undefined;

    const response = await createPrivateCloudComment(licencePlate, requestData);

    const responseBody = await response.json();

    expect(response.status).toBe(201);
  });

  it('should successfully create a comment with only requestId provided', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole('admin');

    requestData.projectId = undefined;

    const response = await createPrivateCloudComment(licencePlate, requestData);

    const responseBody = await response.json();

    expect(response.status).toBe(201);
  });
});
