import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { DecisionStatus, RequestType } from '@/prisma/client';
import { mockSessionByIdirGuid, mockSessionByRole, mockTeamServiceAccount } from '@/services/api-test/core';
import { createPrivateCloudProduct } from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';
import {
  addPrivateCloudProductRepository,
  provisionPrivateCloudProduct,
  removePrivateCloudProductRepository,
} from '@/services/api-test/v1/private-cloud';

const PO = mockNoRoleUsers[0];

const repositoryUrl = 'https://github.com/bcgov-c/tenant-gitops-test123';

const existingRepositoryUrl = 'https://github.com/bcgov/platform-services-registry';

let licencePlate: string;

describe('API: Private Cloud Product Repositories', () => {
  it('should successfully create and provision a private cloud product', async () => {
    await mockSessionByIdirGuid(PO.idirGuid);

    const requestData = createSamplePrivateCloudProductData({
      data: {
        projectOwner: PO,
      },
    });

    const res1 = await createPrivateCloudProduct(requestData);
    expect(res1.status).toBe(200);

    const dat1 = await res1.json();
    licencePlate = dat1.licencePlate;

    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const res2 = await makePrivateCloudRequestDecision(dat1.id, {
      ...dat1.decisionData,
      type: RequestType.CREATE,
      decision: DecisionStatus.APPROVED,
    });

    expect(res2.status).toBe(200);

    await mockTeamServiceAccount(['private-admin']);

    const res3 = await provisionPrivateCloudProduct(licencePlate);
    expect(res3.status).toBe(200);
  });

  it('should add a repository to the private cloud product', async () => {
    await mockTeamServiceAccount(['private-admin']);

    const response = await addPrivateCloudProductRepository(licencePlate, repositoryUrl);

    expect(response.status).toBe(200);

    const product = await prisma.privateCloudProduct.findUnique({
      where: {
        licencePlate,
      },
    });

    expect(product?.repositories).toEqual([
      {
        url: repositoryUrl,
      },
    ]);
    expect(product?.hasRepositories).toBe(true);
  });

  it('should not add a duplicate repository', async () => {
    await mockTeamServiceAccount(['private-admin']);

    const response = await addPrivateCloudProductRepository(licencePlate, repositoryUrl);

    expect(response.status).toBe(200);

    const product = await prisma.privateCloudProduct.findUnique({
      where: {
        licencePlate,
      },
    });

    expect(product?.repositories).toHaveLength(1);
    expect(product?.repositories).toEqual([
      {
        url: repositoryUrl,
      },
    ]);
  });

  it('should preserve existing repositories when adding a repository', async () => {
    await prisma.privateCloudProduct.update({
      where: {
        licencePlate,
      },
      data: {
        hasRepositories: true,
        repositories: [
          {
            url: existingRepositoryUrl,
          },
        ],
      },
    });

    await mockTeamServiceAccount(['private-admin']);

    const response = await addPrivateCloudProductRepository(licencePlate, repositoryUrl);

    expect(response.status).toBe(200);

    const product = await prisma.privateCloudProduct.findUnique({
      where: {
        licencePlate,
      },
    });

    expect(product?.repositories).toEqual([
      {
        url: existingRepositoryUrl,
      },
      {
        url: repositoryUrl,
      },
    ]);
    expect(product?.hasRepositories).toBe(true);
  });

  it('should remove only the requested repository', async () => {
    await mockTeamServiceAccount(['private-admin']);

    const response = await removePrivateCloudProductRepository(licencePlate, repositoryUrl);

    expect(response.status).toBe(200);

    const product = await prisma.privateCloudProduct.findUnique({
      where: {
        licencePlate,
      },
    });

    expect(product?.repositories).toEqual([
      {
        url: existingRepositoryUrl,
      },
    ]);
    expect(product?.hasRepositories).toBe(true);
  });

  it('should successfully remove a repository that does not exist', async () => {
    await mockTeamServiceAccount(['private-admin']);

    const response = await removePrivateCloudProductRepository(licencePlate, repositoryUrl);

    expect(response.status).toBe(200);

    const product = await prisma.privateCloudProduct.findUnique({
      where: {
        licencePlate,
      },
    });

    expect(product?.repositories).toEqual([
      {
        url: existingRepositoryUrl,
      },
    ]);
    expect(product?.hasRepositories).toBe(true);
  });

  it('should set hasRepositories to false when the last repository is removed', async () => {
    await mockTeamServiceAccount(['private-admin']);

    const response = await removePrivateCloudProductRepository(licencePlate, existingRepositoryUrl);

    expect(response.status).toBe(200);

    const product = await prisma.privateCloudProduct.findUnique({
      where: {
        licencePlate,
      },
    });

    expect(product?.repositories).toEqual([]);
    expect(product?.hasRepositories).toBe(false);
  });

  it('should return 404 when the private cloud product does not exist', async () => {
    await mockTeamServiceAccount(['private-admin']);

    const response = await addPrivateCloudProductRepository('missing', repositoryUrl);

    expect(response.status).toBe(404);
  });

  it('should reject a service account without the private-admin role', async () => {
    await mockTeamServiceAccount([]);

    const response = await addPrivateCloudProductRepository(licencePlate, repositoryUrl);

    expect(response.status).toBe(401);
  });
});
