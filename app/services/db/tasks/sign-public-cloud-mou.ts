import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { TaskStatus, TaskType } from '@/prisma/client';
import { sendExpenseAuthorityMou, sendExpenseAuthorityMouProduct } from '@/services/ches/public-cloud/emails';
import {
  PublicCloudRequestDetailDecorated,
  PublicCloudProductDetailDecorated,
  PublicCloudBillingDetailDecorated,
} from '@/types/public-cloud';

const type = TaskType.SIGN_PUBLIC_CLOUD_MOU;

export interface CreateSignPublicCloudMouTaskData {
  request?: PublicCloudRequestDetailDecorated | null;
  product?: PublicCloudProductDetailDecorated | null;
  billing: PublicCloudBillingDetailDecorated;
}

function isValidData(data: CreateSignPublicCloudMouTaskData) {
  const { request, product } = data;
  return product || request;
}

export async function sendSignPublicCloudMouTaskEmail(data: CreateSignPublicCloudMouTaskData) {
  if (!isValidData(data)) return null;

  if (data.request) {
    return sendExpenseAuthorityMou(data.request, data.billing);
  }

  if (data.product) {
    return sendExpenseAuthorityMouProduct(data.product, data.billing);
  }
}

export async function createSignPublicCloudMouTask(data: CreateSignPublicCloudMouTaskData) {
  if (!isValidData(data)) return null;

  let licencePlate = '';
  let expenseAuthorityId = '';

  if (data.request) {
    const { decisionData } = data.request;
    licencePlate = decisionData.licencePlate;
    expenseAuthorityId = decisionData.expenseAuthorityId ?? '';
  } else if (data.product) {
    licencePlate = data.product.licencePlate;
    expenseAuthorityId = data.product.expenseAuthorityId ?? '';
  }

  if (!licencePlate || !expenseAuthorityId) {
    return null;
  }

  const taskProm = prisma.task.create({
    data: {
      type,
      status: TaskStatus.ASSIGNED,
      userIds: [expenseAuthorityId],
      data: {
        licencePlate,
      },
    },
  });

  const emailProm = sendSignPublicCloudMouTaskEmail(data);

  const [task] = await Promise.all([taskProm, emailProm]);
  return task;
}

export interface CloseSignPublicCloudMouTaskData {
  licencePlate: string;
  session: Session;
}

export async function closeSignPublicCloudMouTask(data: CloseSignPublicCloudMouTaskData) {
  const { licencePlate, session } = data;

  const taskProm = prisma.task.updateMany({
    where: {
      type,
      status: TaskStatus.ASSIGNED,
      OR: [{ userIds: { has: session.user.id } }, { roles: { hasSome: session.roles } }],
      data: {
        equals: {
          licencePlate,
        },
      },
    },
    data: {
      status: TaskStatus.COMPLETED,
      completedAt: new Date(),
      completedBy: session.user.id,
      closedMetadata: {},
    },
  });

  const [tasks] = await Promise.all([taskProm]);
  return tasks.count;
}
