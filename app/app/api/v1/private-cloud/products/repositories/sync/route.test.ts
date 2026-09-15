import { expect } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { DecisionStatus, RequestType } from '@/prisma/client';
import { mockSessionByRole, mockTeamServiceAccount } from '@/services/api-test/core';
import { createPrivateCloudProduct } from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';
import { provisionPrivateCloudProduct } from '@/services/api-test/v1/private-cloud';
import { POST } from './route';

const routeUrl = 'http://localhost/api/v1/private-cloud/products/repositories/sync';

const createSyncRequest = (repositories: unknown) =>
  new NextRequest(routeUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(repositories),
  });

const createProvisionedProduct = async () => {
  await mockSessionByRole(GlobalRole.Admin);

  const requestData = createSamplePrivateCloudProductData();

  const createResponse = await createPrivateCloudProduct(requestData);
  expect(createResponse.status).toBe(200);

  const created = await createResponse.json();

  await mockSessionByRole(GlobalRole.PrivateReviewer);

  const decisionResponse = await makePrivateCloudRequestDecision(created.id, {
    ...created.decisionData,
    type: RequestType.CREATE,
    decision: DecisionStatus.APPROVED,
  });

  expect(decisionResponse.status).toBe(200);

  await mockTeamServiceAccount(['private-admin']);

  const provisionResponse = await provisionPrivateCloudProduct(created.licencePlate);
  expect(provisionResponse.status).toBe(200);

  const product = await prisma.privateCloudProduct.findUnique({
    where: {
      licencePlate: created.licencePlate,
    },
  });

  expect(product).not.toBeNull();

  return product!;
};

const syncRepositories = async (repositories: string[]) => {
  // Keep a valid application session during route tests.
  // keycloakOauth2 itself is handled by the shared API handler.
  await mockSessionByRole(GlobalRole.Admin);

  return POST(createSyncRequest(repositories), {});
};

describe('API: Sync Private Cloud GitOps Repositories', () => {
  beforeEach(async () => {
    await prisma.privateCloudProduct.deleteMany();
  });

  it('should add a GitOps repository to the matching product', async () => {
    const product = await createProvisionedProduct();

    const repoName = `tenant-gitops-${product.licencePlate.toLowerCase()}`;
    const repoUrl = `https://github.com/bcgov-c/${repoName}`;

    const response = await syncRepositories([repoName]);

    expect(response.status).toBe(200);

    const updatedProduct = await prisma.privateCloudProduct.findUnique({
      where: {
        id: product.id,
      },
    });

    expect(updatedProduct?.repositories).toContainEqual({
      url: repoUrl,
    });

    expect(updatedProduct?.hasRepositories).toBe(true);
  });

  it('should preserve existing repository links when adding a GitOps repository', async () => {
    const product = await createProvisionedProduct();

    const manualRepositoryUrl = 'https://github.com/bcgov/example-repository';

    await prisma.privateCloudProduct.update({
      where: {
        id: product.id,
      },
      data: {
        repositories: [{ url: manualRepositoryUrl }],
        hasRepositories: true,
      },
    });

    const repoName = `tenant-gitops-${product.licencePlate.toLowerCase()}`;
    const repoUrl = `https://github.com/bcgov-c/${repoName}`;

    const response = await syncRepositories([repoName]);

    expect(response.status).toBe(200);

    const updatedProduct = await prisma.privateCloudProduct.findUnique({
      where: {
        id: product.id,
      },
    });

    expect(updatedProduct?.repositories).toEqual(
      expect.arrayContaining([{ url: manualRepositoryUrl }, { url: repoUrl }]),
    );

    expect(updatedProduct?.repositories).toHaveLength(2);
    expect(updatedProduct?.hasRepositories).toBe(true);
  });

  it('should not duplicate an existing GitOps repository', async () => {
    const product = await createProvisionedProduct();

    const repoName = `tenant-gitops-${product.licencePlate.toLowerCase()}`;
    const repoUrl = `https://github.com/bcgov-c/${repoName}`;

    await prisma.privateCloudProduct.update({
      where: {
        id: product.id,
      },
      data: {
        repositories: [{ url: repoUrl }],
        hasRepositories: true,
      },
    });

    const response = await syncRepositories([repoName]);

    expect(response.status).toBe(200);

    const updatedProduct = await prisma.privateCloudProduct.findUnique({
      where: {
        id: product.id,
      },
    });

    const matchingRepositories = updatedProduct?.repositories.filter(
      (repository) => repository.url.toLowerCase() === repoUrl.toLowerCase(),
    );

    expect(matchingRepositories).toHaveLength(1);
  });

  it('should remove a stale GitOps repository and preserve manual repository links', async () => {
    const staleProduct = await createProvisionedProduct();
    const currentProduct = await createProvisionedProduct();

    const staleRepoUrl = `https://github.com/bcgov-c/tenant-gitops-${staleProduct.licencePlate.toLowerCase()}`;
    const manualRepositoryUrl = 'https://github.com/bcgov/manual-repository';

    await prisma.privateCloudProduct.update({
      where: {
        id: staleProduct.id,
      },
      data: {
        repositories: [{ url: staleRepoUrl }, { url: manualRepositoryUrl }],
        hasRepositories: true,
      },
    });

    const currentRepoName = `tenant-gitops-${currentProduct.licencePlate.toLowerCase()}`;

    const response = await syncRepositories([currentRepoName]);

    expect(response.status).toBe(200);

    const updatedProduct = await prisma.privateCloudProduct.findUnique({
      where: {
        id: staleProduct.id,
      },
    });

    expect(updatedProduct?.repositories).toEqual([{ url: manualRepositoryUrl }]);
    expect(updatedProduct?.hasRepositories).toBe(true);
  });

  it('should set hasRepositories to false when the stale GitOps repository is the last repository', async () => {
    const staleProduct = await createProvisionedProduct();
    const currentProduct = await createProvisionedProduct();

    const staleRepoUrl = `https://github.com/bcgov-c/tenant-gitops-${staleProduct.licencePlate.toLowerCase()}`;

    await prisma.privateCloudProduct.update({
      where: {
        id: staleProduct.id,
      },
      data: {
        repositories: [{ url: staleRepoUrl }],
        hasRepositories: true,
      },
    });

    const currentRepoName = `tenant-gitops-${currentProduct.licencePlate.toLowerCase()}`;

    const response = await syncRepositories([currentRepoName]);

    expect(response.status).toBe(200);

    const updatedProduct = await prisma.privateCloudProduct.findUnique({
      where: {
        id: staleProduct.id,
      },
    });

    expect(updatedProduct?.repositories).toEqual([]);
    expect(updatedProduct?.hasRepositories).toBe(false);
  });

  it('should be idempotent when the same repository list is synchronized more than once', async () => {
    const product = await createProvisionedProduct();

    const repoName = `tenant-gitops-${product.licencePlate.toLowerCase()}`;
    const repoUrl = `https://github.com/bcgov-c/${repoName}`;

    const response1 = await syncRepositories([repoName]);
    expect(response1.status).toBe(200);

    const response2 = await syncRepositories([repoName]);
    expect(response2.status).toBe(200);

    const updatedProduct = await prisma.privateCloudProduct.findUnique({
      where: {
        id: product.id,
      },
    });

    expect(
      updatedProduct?.repositories.filter((repository) => repository.url.toLowerCase() === repoUrl.toLowerCase()),
    ).toHaveLength(1);
  });

  it('should return unknown licence plates as skipped', async () => {
    await createProvisionedProduct();

    const response = await syncRepositories(['tenant-gitops-ffffff']);

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.skipped).toContain('ffffff');
  });

  it('should reject an empty repository list', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await POST(createSyncRequest([]), {});

    expect(response.status).toBe(400);
  });

  it('should reject an invalid GitOps repository name', async () => {
    await mockSessionByRole(GlobalRole.Admin);

    const response = await POST(createSyncRequest(['tenant-gitops-NOT-VALID']), {});

    expect(response.status).toBe(400);
  });
});
