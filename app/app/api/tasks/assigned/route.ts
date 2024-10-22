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
  const licencePlates = [];

  const tasks = await prisma.task.findMany({
    where: {
      OR: [{ userIds: { has: session.user.id } }, { roles: { hasSome: session.roles } }],
      status: TaskStatus.ASSIGNED,
    },
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
  });

  let processedTasks = tasks.map(({ id, type, status, createdAt, completedAt, completedBy, data, closedMetadata }) => {
    return { id, type, status, createdAt, completedAt, completedBy, data, closedMetadata, link: '', description: '' };
  });

  for (const task of tasks) {
    switch (task.type) {
      case TaskType.SIGN_MOU:
      case TaskType.REVIEW_MOU:
        const data = task.data as { licencePlate: string };
        licencePlates.push(data.licencePlate);
    }
  }

  const cleanLicencePlates = getUniqueNonFalsyItems(licencePlates);

  const [products, requests] = await Promise.all([
    prisma.publicCloudProject.findMany({
      where: { licencePlate: { in: cleanLicencePlates } },
      select: { id: true, licencePlate: true, name: true },
    }),
    prisma.publicCloudRequest.findMany({
      where: { type: RequestType.CREATE, active: true, licencePlate: { in: cleanLicencePlates } },
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
    switch (task.type) {
      case TaskType.SIGN_MOU:
      case TaskType.REVIEW_MOU:
        const data = task.data as { licencePlate: string };
        const request = requests.find((req) => req.licencePlate === data.licencePlate);
        if (request) {
          task.link = `/public-cloud/requests/${request.id}/request`;
          task.description = request.decisionData.name;
        } else {
          const product = products.find((req) => req.licencePlate === data.licencePlate);
          if (product) {
            task.link = `/public-cloud/products/${product.licencePlate}/edit`;
            task.description = product.name;
          }
        }
    }

    return task;
  });

  return OkResponse(processedTasks);
});
