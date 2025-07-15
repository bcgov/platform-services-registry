import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { TaskStatus, TaskType } from '@/prisma/client';
import { getUsersEmailsByIds } from '@/services/db/user';
import { getUniqueNonFalsyItems } from '@/utils/js';

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
});

export const GET = apiHandler(async ({ session }) => {
  const privateCloudLicencePlates: string[] = [];
  const publicCloudLicencePlates: string[] = [];
  const privateCloudRequestIds: string[] = [];
  const publicCloudRequestIds: string[] = [];

  let assignedTasks = session.tasks.map(
    ({ id, type, status, createdAt, completedAt, completedBy, startedAt, startedBy, data, closedMetadata }) => {
      return {
        id,
        type,
        status,
        createdAt,
        completedAt,
        completedBy,
        startedAt,
        startedBy,
        data,
        closedMetadata,
        link: '',
        description: '',
      };
    },
  );

  for (const task of assignedTasks) {
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
    prisma.publicCloudProduct.findMany({
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

  assignedTasks = assignedTasks.map((task) => {
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
            task.link = `/public-cloud/products/${product.licencePlate}/billing`;
            task.description = product.name;
          }
        }
        break;
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

  const userIds = assignedTasks.map((task) => (task.status === TaskStatus.STARTED ? task.startedBy : null));
  const users = await getUsersEmailsByIds(userIds);

  return OkResponse({ assignedTasks, users });
});
