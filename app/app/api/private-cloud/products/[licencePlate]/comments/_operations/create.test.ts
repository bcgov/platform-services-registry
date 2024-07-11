import { expect } from '@jest/globals';
import { createSamplePrivateCloudCommentData } from '@/helpers/mock-resources';
import { findOtherMockUsers, generateTestSession } from '@/helpers/mock-users';
import { mockSessionByEmail, mockSessionByRole } from '@/services/api-test/core';
import { createPrivateCloudComment } from '@/services/api-test/private-cloud/products';

const fieldsToCompare = ['text', 'userId', 'projectId', 'requestId'];

describe('Create Private Cloud Comment - Permissions', () => {
  it('should return 401 for unauthenticated user', async () => {
    await mockSessionByEmail();

    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    console.log('Request Data:', requestData);

    const response = await createPrivateCloudComment(licencePlate, requestData);
    console.log('Response Status:', response.status);
    console.log('Response Body:', await response.text());

    expect(response.status).toBe(401);
  });

  it('should successfully submit a create comment request for admin', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole('admin');

    console.log('Request Data:', requestData);

    const response = await createPrivateCloudComment(licencePlate, requestData);
    console.log('Response Status:', response.status);

    const responseBody = await response.text();
    console.log('Response Body:', responseBody);
    if (response.headers.get('content-type')?.includes('application/json')) {
      const resData = JSON.parse(responseBody);
      console.log('Response Data:', resData);

      expect(resData).toEqual(
        expect.objectContaining({
          text: requestData.text,
          userId: expect.any(String),
          projectId: requestData.projectId,
          requestId: requestData.requestId,
        }),
      );
    }
    expect(response.status).toBe(201);
  });

  it('should successfully submit a create comment request for private-admin', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole('private-admin');

    console.log('Request Data:', requestData);

    const response = await createPrivateCloudComment(licencePlate, requestData);
    console.log('Response Status:', response.status);

    const responseBody = await response.text();
    console.log('Response Body:', responseBody);
    if (response.headers.get('content-type')?.includes('application/json')) {
      const resData = JSON.parse(responseBody);
      console.log('Response Data:', resData);

      expect(resData).toEqual(
        expect.objectContaining({
          text: requestData.text,
          userId: expect.any(String),
          projectId: requestData.projectId,
          requestId: requestData.requestId,
        }),
      );
    }
    expect(response.status).toBe(201);
  });

  it('should fail to submit a create comment request for a non-assigned user', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    const otherUsers = findOtherMockUsers([requestData.userId]);
    await mockSessionByEmail(otherUsers[0].email);

    console.log('Request Data:', requestData);

    const response = await createPrivateCloudComment(licencePlate, requestData);
    console.log('Response Status:', response.status);
    console.log('Response Body:', await response.text());

    expect(response.status).toBe(401);
  });
});

describe('Create Private Cloud Comment - Validations', () => {
  it('should fail to submit a create comment request due to missing text property', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole('admin');

    requestData.text = '';

    console.log('Request Data:', requestData);

    const response = await createPrivateCloudComment(licencePlate, requestData);
    console.log('Response Status:', response.status);

    const responseBody = await response.text();
    console.log('Response Body:', responseBody);
    if (response.headers.get('content-type')?.includes('application/json')) {
      const resData = JSON.parse(responseBody);
      console.log('Response Data:', resData);

      expect(resData.success).toBe(false);
      expect(resData.message).toBe('Bad Request');
      expect(resData.error.issues.find((iss: { path: string[] }) => iss.path[0] === 'text')).not.toBeUndefined();
    }
    expect(response.status).toBe(400);
  });

  it('should fail to submit a create comment request due to missing projectId and requestId', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole('admin');

    requestData.projectId = undefined;
    requestData.requestId = undefined;

    console.log('Request Data:', requestData);

    const response = await createPrivateCloudComment(licencePlate, requestData);
    console.log('Response Status:', response.status);

    const responseBody = await response.text();
    console.log('Response Body:', responseBody);
    if (response.headers.get('content-type')?.includes('application/json')) {
      const resData = JSON.parse(responseBody);
      console.log('Response Data:', resData);

      expect(resData.success).toBe(false);
      expect(resData.message).toBe('Bad Request');
      expect(
        resData.error.issues.find((iss: { path: string[] }) => ['projectId', 'requestId'].includes(iss.path[0])),
      ).not.toBeUndefined();
    }
    expect(response.status).toBe(400);
  });

  it('should successfully create a comment with only projectId provided', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole('admin');

    requestData.requestId = undefined;

    console.log('Request Data:', requestData);

    const response = await createPrivateCloudComment(licencePlate, requestData);
    console.log('Response Status:', response.status);

    const responseBody = await response.text();
    console.log('Response Body:', responseBody);
    if (response.headers.get('content-type')?.includes('application/json')) {
      const resData = JSON.parse(responseBody);
      console.log('Response Data:', resData);
    }
    expect(response.status).toBe(201);
  });

  it('should successfully create a comment with only requestId provided', async () => {
    const licencePlate = 'test-licence-plate';
    const requestData = createSamplePrivateCloudCommentData();
    await mockSessionByRole('admin');

    requestData.projectId = undefined;

    console.log('Request Data:', requestData);

    const response = await createPrivateCloudComment(licencePlate, requestData);
    console.log('Response Status:', response.status);

    const responseBody = await response.text();
    console.log('Response Body:', responseBody);
    if (response.headers.get('content-type')?.includes('application/json')) {
      const resData = JSON.parse(responseBody);
      console.log('Response Data:', resData);
    }
    expect(response.status).toBe(201);
  });
});
