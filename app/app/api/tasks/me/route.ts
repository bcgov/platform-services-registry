import { TaskType, TaskStatus, Prisma } from '@prisma/client';
import { GlobalPermissions, GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { getUniqueNonFalsyItems } from '@/utils/collection';

const apiHandler = createApiHandler({
  roles: [GlobalRole.Admin],
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
    return { id, type, status, createdAt, completedAt, completedBy, data, closedMetadata, link: '' };
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
      select: { id: true, licencePlate: true },
    }),
    prisma.publicCloudRequest.findMany({
      where: { licencePlate: { in: cleanLicencePlates } },
      select: { id: true, licencePlate: true },
    }),
  ]);

  processedTasks = processedTasks.map((task) => {
    switch (task.type) {
      case TaskType.SIGN_MOU:
      case TaskType.REVIEW_MOU:
        const data = task.data as { licencePlate: string };
        const request = requests.find((req) => req.licencePlate === data.licencePlate);
        if (request) task.link = `/public-cloud/requests/${request.id}/request`;
        else {
          const product = products.find((req) => req.licencePlate === data.licencePlate);
          if (product) task.link = `/public-cloud/products/${product.licencePlate}/edit`;
        }
    }

    return task;
  });

  return OkResponse(processedTasks);
});
