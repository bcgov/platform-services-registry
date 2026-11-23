import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { TaskStatus, TaskType } from '@/prisma/client';
import { sendExpenseAuthorityMou, sendExpenseAuthorityMouProduct } from '@/services/ches/public-cloud/emails';
import {
  PublicCloudRequestDetailDecorated,
  PublicCloudProductDetailDecorated,
  PublicCloudBillingDetailDecorated,
} from '@/types/public-cloud';

export const type = TaskType.SIGN_PUBLIC_CLOUD_MOU;

export interface CreateTaskData {
  request?: PublicCloudRequestDetailDecorated | null;
  product?: PublicCloudProductDetailDecorated | null;
  billing: PublicCloudBillingDetailDecorated;
}

function isValidData(data: CreateTaskData) {
  const { request, product } = data;
  return product || request;
}

export async function sendTaskEmail(data: CreateTaskData) {
  if (!isValidData(data)) return null;

  if (data.request) {
    return sendExpenseAuthorityMou(data.request, data.billing);
  }

  if (data.product) {
    return sendExpenseAuthorityMouProduct(data.product, data.billing);
  }
}

export async function createTask(data: CreateTaskData) {
  if (!isValidData(data)) return null;

  let licencePlate = '';
  const expenseAuthorityId = data.billing.expenseAuthorityId;

  if (data.request) {
    licencePlate = data.request.decisionData.licencePlate;
  } else if (data.product) {
    licencePlate = data.product.licencePlate;
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
        billingId: data.billing.id,
      },
    },
  });

  const emailProm = sendTaskEmail(data);

  const [task] = await Promise.all([taskProm, emailProm]);
  return task;
}

export interface CloseTaskData {
  licencePlate: string;
  billingId: string;
  session: Session;
}

export async function closeTask(data: CloseTaskData) {
  const { licencePlate, billingId, session } = data;

  const result = await prisma.task.updateMany({
    where: {
      type,
      status: { in: [TaskStatus.ASSIGNED, TaskStatus.STARTED] },
      data: { equals: { licencePlate, billingId } },
      OR: [{ userIds: { has: session.user.id } }, { roles: { hasSome: session.roles } }],
    },
    data: {
      status: TaskStatus.COMPLETED,
      completedAt: new Date(),
      completedBy: session.user.id,
      closedMetadata: {},
    },
  });

  return result.count;
}
