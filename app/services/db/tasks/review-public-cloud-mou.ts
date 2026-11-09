import { Session } from 'next-auth';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { TaskStatus, TaskType } from '@/prisma/client';
import { sendBillingReviewerMou, sendBillingReviewerMouProduct } from '@/services/ches/public-cloud/emails';
import {
  PublicCloudBillingDetailDecorated,
  PublicCloudProductDetailDecorated,
  PublicCloudRequestDetailDecorated,
} from '@/types/public-cloud';

export const type = TaskType.REVIEW_PUBLIC_CLOUD_MOU;

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
    return sendBillingReviewerMou(data.request, data.billing);
  }

  if (data.product) {
    return sendBillingReviewerMouProduct(data.product, data.billing);
  }
}

export async function createTask(data: CreateTaskData) {
  if (!isValidData(data)) return null;

  const taskProm = prisma.task.create({
    data: {
      type,
      status: TaskStatus.ASSIGNED,
      roles: [GlobalRole.BillingReviewer],
      data: {
        licencePlate: data.billing.licencePlate,
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
  decision: 'APPROVE' | 'REJECT';
}

export async function closeTask(data: CloseTaskData) {
  const { licencePlate, billingId, session, decision } = data;

  const result = await prisma.task.updateMany({
    where: {
      type,
      status: { in: [TaskStatus.ASSIGNED, TaskStatus.STARTED] },
      data: {
        equals: { licencePlate, billingId },
      },
      OR: [{ userIds: { has: session.user.id } }, { roles: { hasSome: session.roles } }],
    },
    data: {
      status: TaskStatus.COMPLETED,
      completedAt: new Date(),
      completedBy: session.user.id,
      closedMetadata: { decision },
    },
  });

  return result.count;
}
