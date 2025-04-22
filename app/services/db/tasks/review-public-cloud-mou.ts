import { Session } from 'next-auth';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { TaskStatus, TaskType } from '@/prisma/types';
import { sendBillingReviewerMou, sendBillingReviewerMouProduct } from '@/services/ches/public-cloud/emails';
import {
  PublicCloudBillingDetailDecorated,
  PublicCloudProductDetailDecorated,
  PublicCloudRequestDetailDecorated,
} from '@/types/public-cloud';

const type = TaskType.REVIEW_PUBLIC_CLOUD_MOU;

export interface CreateReviewPublicCloudMouTaskData {
  request?: PublicCloudRequestDetailDecorated | null;
  product?: PublicCloudProductDetailDecorated | null;
  billing: PublicCloudBillingDetailDecorated;
}

function isValidData(data: CreateReviewPublicCloudMouTaskData) {
  const { request, product } = data;
  return product || request;
}

export async function sendReviewPublicCloudMouTaskEmail(data: CreateReviewPublicCloudMouTaskData) {
  if (!isValidData(data)) return null;

  if (data.request) {
    return sendBillingReviewerMou(data.request, data.billing);
  }

  if (data.product) {
    return sendBillingReviewerMouProduct(data.product, data.billing);
  }
}

export async function createReviewPublicCloudMouTask(data: CreateReviewPublicCloudMouTaskData) {
  if (!isValidData(data)) return null;

  const taskProm = prisma.task.create({
    data: {
      type,
      status: TaskStatus.ASSIGNED,
      roles: [GlobalRole.BillingReviewer],
      data: {
        licencePlate: data.billing.licencePlate,
      },
    },
  });

  const emailProm = sendReviewPublicCloudMouTaskEmail(data);

  const [task] = await Promise.all([taskProm, emailProm]);
  return task;
}

export interface CloseReviewPublicCloudMouTaskData {
  licencePlate: string;
  session: Session;
  decision: 'APPROVE' | 'REJECT';
}

export async function closeReviewPublicCloudMouTask(data: CloseReviewPublicCloudMouTaskData) {
  const { licencePlate, session, decision } = data;

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
      closedMetadata: {
        decision,
      },
    },
  });

  const [tasks] = await Promise.all([taskProm]);
  return tasks.count;
}
