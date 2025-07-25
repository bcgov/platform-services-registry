import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import { createSamplePrivateCloudCommentData } from '@/helpers/mock-resources';
import { findOtherMockUsers } from '@/helpers/mock-users';
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
    await mockSessionByRole(GlobalRole.Admin);

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
    await mockSessionByRole(GlobalRole.PrivateAdmin);

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
    await mockSessionByRole(GlobalRole.Admin);

    requestData.text = '';

    const response = await createPrivateCloudComment(licencePlate, requestData);

    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.success).toBe(false);
    expect(responseBody.message).toBe('Bad Request');
    const issues = JSON.parse(responseBody.error.message);
    expect(issues.find((iss: { path: string[] }) => iss.path[0] === 'text')).not.toBeUndefined();
  });

  it('should fail to submit a create comment request due to missing projectId and requestId', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.projectId = undefined;
    requestData.requestId = undefined;

    const response = await createPrivateCloudComment(licencePlate, requestData);

    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.success).toBe(false);
    expect(responseBody.message).toBe('Bad Request');
    const issues = JSON.parse(responseBody.error.message);
    expect(
      issues.find((iss: { path: string[] }) => ['projectId', 'requestId'].includes(iss.path[0])),
    ).not.toBeUndefined();
  });

  it('should fail to submit a create comment request due to invalid projectId', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.projectId = 'invalid-object-id';

    const response = await createPrivateCloudComment(licencePlate, requestData);

    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.success).toBe(false);
  });

  it('should fail to submit a create comment request due to invalid requestId', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.requestId = 'invalid-object-id';

    const response = await createPrivateCloudComment(licencePlate, requestData);

    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.success).toBe(false);
  });

  it('should successfully create a comment with only projectId provided', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.requestId = undefined;

    const response = await createPrivateCloudComment(licencePlate, requestData);

    const responseBody = await response.json();

    expect(response.status).toBe(201);
  });

  it('should successfully create a comment with only requestId provided', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole(GlobalRole.Admin);

    requestData.projectId = undefined;

    const response = await createPrivateCloudComment(licencePlate, requestData);

    const responseBody = await response.json();

    expect(response.status).toBe(201);
  });
});
