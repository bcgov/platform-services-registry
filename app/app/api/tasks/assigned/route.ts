import { TaskType, TaskStatus, Prisma, RequestType } from '@prisma/client';
import { GlobalPermissions, GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { getUniqueNonFalsyItems } from '@/utils/collection';

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
});

export const GET = apiHandler(async ({ session }) => {
  const privateCloudLicencePlates = [];
  const publicCloudLicencePlates = [];
  const privateCloudRequestIds = [];
  const publicCloudRequestIds = [];

  let processedTasks = session.tasks.map(
    ({ id, type, status, createdAt, completedAt, completedBy, data, closedMetadata }) => {
      return { id, type, status, createdAt, completedAt, completedBy, data, closedMetadata, link: '', description: '' };
    },
  );

  for (const task of processedTasks) {
    switch (task.type) {
      case TaskType.SIGN_PUBLIC_CLOUD_MOU:
      case TaskType.REVIEW_PUBLIC_CLOUD_MOU:
        publicCloudLicencePlates.push((task.data as { licencePlate: string }).licencePlate);
        break;
      case TaskType.REVIEW_PRIVATE_CLOUD_REQUEST:
        privateCloudRequestIds.push((task.data as { requestId: string }).requestId);
        break;
      case TaskType.REVIEW_PUBLIC_CLOUD_REQUEST:
        publicCloudRequestIds.push((task.data as { requestId: string }).requestId);
        break;
    }
  }

  const cleanPublicCloudLicencePlates = getUniqueNonFalsyItems(publicCloudLicencePlates);
  const cleanPrivateCloudRequestIds = getUniqueNonFalsyItems(privateCloudRequestIds);
  const cleanPublicCloudRequestIds = getUniqueNonFalsyItems(publicCloudRequestIds);

  const [privateCloudRequests, publicCloudProducts, publicCloudRequests] = await Promise.all([
    prisma.privateCloudRequest.findMany({
      where: { active: true, id: { in: cleanPrivateCloudRequestIds } },
      include: {
        decisionData: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.publicCloudProject.findMany({
      where: { licencePlate: { in: cleanPublicCloudLicencePlates } },
      select: { id: true, licencePlate: true, name: true },
    }),
    prisma.publicCloudRequest.findMany({
      where: {
        active: true,
        OR: [{ id: { in: cleanPublicCloudRequestIds } }, { licencePlate: { in: cleanPublicCloudLicencePlates } }],
      },
      include: {
        decisionData: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  processedTasks = processedTasks.map((task) => {
    let data!: any;
    let product!: any;
    let request!: any;

    switch (task.type) {
      case TaskType.SIGN_PUBLIC_CLOUD_MOU:
      case TaskType.REVIEW_PUBLIC_CLOUD_MOU:
        data = task.data as { licencePlate: string };
        request = publicCloudRequests.find((req) => req.licencePlate === data.licencePlate);
        if (request) {
          task.link = `/public-cloud/requests/${request.id}/request`;
          task.description = request.decisionData.name;
        } else {
          product = publicCloudProducts.find((req) => req.licencePlate === data.licencePlate);
          if (product) {
            task.link = `/public-cloud/products/${product.licencePlate}/edit`;
            task.description = product.name;
          }
        }
      case TaskType.REVIEW_PRIVATE_CLOUD_REQUEST:
        data = task.data as { requestId: string };
        request = privateCloudRequests.find((req) => req.id === data.requestId);
        if (request) {
          task.link = `/private-cloud/requests/${request.id}/decision`;
          task.description = request.decisionData.name;
        }
        break;
      case TaskType.REVIEW_PUBLIC_CLOUD_REQUEST:
        data = task.data as { requestId: string };
        request = publicCloudRequests.find((req) => req.id === data.requestId);
        if (request) {
          task.link = `/public-cloud/requests/${request.id}/request`;
          task.description = request.decisionData.name;
        }
        break;
    }

    return task;
  });

  return OkResponse(processedTasks);
});
