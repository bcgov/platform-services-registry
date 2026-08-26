import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { Cluster, DecisionStatus, PrivateCloudProductMemberRole, RequestType } from '@/prisma/client';
import { mockSessionByIdirGuid, mockSessionByRole, mockTeamServiceAccount } from '@/services/api-test/core';
import {
  createPrivateCloudProduct,
  updatePrivateCloudProductRepositories,
} from '@/services/api-test/private-cloud/products';
import { makePrivateCloudRequestDecision } from '@/services/api-test/private-cloud/requests';
import { provisionPrivateCloudProduct } from '@/services/api-test/v1/private-cloud';

const PO = mockNoRoleUsers[0];
const TL1 = mockNoRoleUsers[1];
const TL2 = mockNoRoleUsers[2];
const VIEWER = mockNoRoleUsers[3];

const memberData = {
  projectOwner: PO,
  primaryTechnicalLead: TL1,
  secondaryTechnicalLead: TL2,
};

let licencePlate = '';
describe('PATCH Private Cloud Product Repositories', () => {
  it('should delete existing private cloud products', async () => {
    await prisma.privateCloudProduct.deleteMany();

    const productCount = await prisma.privateCloudProduct.count();

    expect(productCount).toBe(0);
  });

  it('should create and provision a private cloud product', async () => {
    await mockSessionByIdirGuid(PO.idirGuid);

    const requestData = createSamplePrivateCloudProductData({
      data: {
        ...memberData,
        cluster: Cluster.SILVER,
        hasRepositories: null,
        repositories: [],
      },
    });

    const createResponse = await createPrivateCloudProduct(requestData);
    const request = await createResponse.json();

    expect(createResponse.status).toBe(200);

    licencePlate = request.licencePlate;

    await mockSessionByRole(GlobalRole.PrivateReviewer);

    const decisionResponse = await makePrivateCloudRequestDecision(request.id, {
      ...request.decisionData,
      type: RequestType.CREATE,
      decision: DecisionStatus.APPROVED,
    });

    expect(decisionResponse.status).toBe(200);

    await mockTeamServiceAccount(['private-admin']);

    const provisionResponse = await provisionPrivateCloudProduct(licencePlate);

    expect(provisionResponse.status).toBe(200);
  });

  it('should add a viewer to the product', async () => {
    const product = await prisma.privateCloudProduct.update({
      where: {
        licencePlate,
      },
      data: {
        members: {
          push: {
            userId: VIEWER.id,
            roles: [PrivateCloudProductMemberRole.VIEWER],
          },
        },
      },
      select: {
        members: true,
      },
    });

    expect(product.members).toContainEqual(
      expect.objectContaining({
        userId: VIEWER.id,
        roles: [PrivateCloudProductMemberRole.VIEWER],
      }),
    );
  });

  it('should allow the product owner to add repositories without creating a request', async () => {
    await mockSessionByIdirGuid(PO.idirGuid);

    const requestCountBefore = await prisma.privateCloudRequest.count({
      where: {
        licencePlate,
      },
    });

    const response = await updatePrivateCloudProductRepositories(licencePlate, {
      hasRepositories: true,
      repositories: [
        {
          url: 'https://github.com/bcgov/example',
        },
      ],
    });

    expect(response.status).toBe(200);

    const product = await prisma.privateCloudProduct.findUniqueOrThrow({
      where: {
        licencePlate,
      },
      select: {
        hasRepositories: true,
        repositories: true,
      },
    });

    expect(product.hasRepositories).toBe(true);
    expect(product.repositories).toEqual([
      {
        url: 'https://github.com/bcgov/example',
      },
    ]);

    const requestCountAfter = await prisma.privateCloudRequest.count({
      where: {
        licencePlate,
      },
    });

    expect(requestCountAfter).toBe(requestCountBefore);
  });

  it('should reject repositories when hasRepositories is false', async () => {
    await mockSessionByIdirGuid(PO.idirGuid);

    const response = await updatePrivateCloudProductRepositories(licencePlate, {
      hasRepositories: false,
      repositories: [
        {
          url: 'https://github.com/bcgov/example',
        },
      ],
    });

    expect(response.status).toBe(400);
  });

  it('should reject an empty repository array when hasRepositories is true', async () => {
    await mockSessionByIdirGuid(PO.idirGuid);

    const response = await updatePrivateCloudProductRepositories(licencePlate, {
      hasRepositories: true,
      repositories: [],
    });

    expect(response.status).toBe(400);
  });

  it('should allow the product owner to confirm that the product has no repositories', async () => {
    await mockSessionByIdirGuid(PO.idirGuid);

    const response = await updatePrivateCloudProductRepositories(licencePlate, {
      hasRepositories: false,
      repositories: [],
    });

    expect(response.status).toBe(200);

    const product = await prisma.privateCloudProduct.findUniqueOrThrow({
      where: {
        licencePlate,
      },
      select: {
        hasRepositories: true,
        repositories: true,
      },
    });

    expect(product.hasRepositories).toBe(false);
    expect(product.repositories).toEqual([]);
  });

  it('should return 403 when a viewer attempts to update repositories', async () => {
    await mockSessionByIdirGuid(VIEWER.idirGuid);

    const response = await updatePrivateCloudProductRepositories(licencePlate, {
      hasRepositories: false,
      repositories: [],
    });

    expect(response.status).toBe(403);
  });

  it('should return 404 when the product does not exist', async () => {
    await mockSessionByIdirGuid(PO.idirGuid);

    const response = await updatePrivateCloudProductRepositories('missing', {
      hasRepositories: false,
      repositories: [],
    });

    expect(response.status).toBe(404);
  });
});
