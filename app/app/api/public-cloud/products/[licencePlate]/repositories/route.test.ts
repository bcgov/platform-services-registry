import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { createSamplePublicCloudProductData } from '@/helpers/mock-resources';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { DecisionStatus, PublicCloudProductMemberRole, RequestType } from '@/prisma/client';
import { mockSessionByIdirGuid, mockSessionByRole, mockTeamServiceAccount } from '@/services/api-test/core';
import {
  createPublicCloudProduct,
  updatePublicCloudProductRepositories,
} from '@/services/api-test/public-cloud/products';
import { makePublicCloudRequestDecision } from '@/services/api-test/public-cloud/requests';
import { provisionPublicCloudProduct } from '@/services/api-test/v1/public-cloud';

const PO = mockNoRoleUsers[0];
const TL1 = mockNoRoleUsers[1];
const TL2 = mockNoRoleUsers[2];
const EA = mockNoRoleUsers[3];
const VIEWER = mockNoRoleUsers[4];

const memberData = {
  projectOwner: PO,
  primaryTechnicalLead: TL1,
  secondaryTechnicalLead: TL2,
  expenseAuthority: EA,
};

let licencePlate = '';

describe('PATCH Public Cloud Product Repositories', () => {
  it('should delete existing public cloud products', async () => {
    await prisma.publicCloudProduct.deleteMany();
  });

  it('should create and provision a public cloud product', async () => {
    await mockSessionByIdirGuid(PO.idirGuid);

    const requestData = createSamplePublicCloudProductData({
      data: {
        ...memberData,
        hasRepositories: null,
        repositories: [],
      },
    });

    const createResponse = await createPublicCloudProduct(requestData);
    const request = await createResponse.json();

    expect(createResponse.status).toBe(200);

    licencePlate = request.licencePlate;

    await mockSessionByRole(GlobalRole.PublicReviewer);

    const decisionResponse = await makePublicCloudRequestDecision(request.id, {
      ...request.decisionData,
      type: RequestType.CREATE,
      decision: DecisionStatus.APPROVED,
    });

    expect(decisionResponse.status).toBe(200);

    await mockTeamServiceAccount(['public-admin']);

    const provisionResponse = await provisionPublicCloudProduct(licencePlate);

    expect(provisionResponse.status).toBe(200);
  });

  it('should add a viewer to the product', async () => {
    await prisma.publicCloudProduct.update({
      where: {
        licencePlate,
      },
      data: {
        members: {
          push: {
            userId: VIEWER.id,
            roles: [PublicCloudProductMemberRole.VIEWER],
          },
        },
      },
    });
  });

  it('should allow the product owner to add repositories without creating a request', async () => {
    await mockSessionByIdirGuid(PO.idirGuid);

    const requestCountBefore = await prisma.publicCloudRequest.count({
      where: {
        licencePlate,
      },
    });

    const response = await updatePublicCloudProductRepositories(licencePlate, {
      hasRepositories: true,
      repositories: [
        {
          url: 'https://github.com/bcgov/example',
        },
      ],
    });

    expect(response.status).toBe(200);

    const product = await prisma.publicCloudProduct.findUniqueOrThrow({
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

    const requestCountAfter = await prisma.publicCloudRequest.count({
      where: {
        licencePlate,
      },
    });

    expect(requestCountAfter).toBe(requestCountBefore);
  });

  it('should reject repositories when hasRepositories is false', async () => {
    await mockSessionByIdirGuid(PO.idirGuid);

    const response = await updatePublicCloudProductRepositories(licencePlate, {
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

    const response = await updatePublicCloudProductRepositories(licencePlate, {
      hasRepositories: true,
      repositories: [],
    });

    expect(response.status).toBe(400);
  });

  it('should allow the product owner to confirm that the product has no repositories', async () => {
    await mockSessionByIdirGuid(PO.idirGuid);

    const response = await updatePublicCloudProductRepositories(licencePlate, {
      hasRepositories: false,
      repositories: [],
    });

    expect(response.status).toBe(200);

    const product = await prisma.publicCloudProduct.findUniqueOrThrow({
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

    const response = await updatePublicCloudProductRepositories(licencePlate, {
      hasRepositories: false,
      repositories: [],
    });

    expect(response.status).toBe(403);
  });

  it('should return 404 when the product does not exist', async () => {
    await mockSessionByIdirGuid(PO.idirGuid);

    const response = await updatePublicCloudProductRepositories('missing', {
      hasRepositories: false,
      repositories: [],
    });

    expect(response.status).toBe(404);
  });
});
