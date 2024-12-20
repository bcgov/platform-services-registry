import { TaskStatus, TaskType } from '@prisma/client';
import { Session } from 'next-auth';
import { GlobalPermissions, GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { sendBillingReviewerMou } from '@/services/ches/public-cloud/emails';
import { BillingGetPayload } from '@/types/billing';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';

const type = TaskType.REVIEW_PUBLIC_CLOUD_MOU;

export interface CreateReviewPublicCloudMouTaskData {
  billing: BillingGetPayload;
  request?: PublicCloudRequestDetailDecorated;
}

export async function createReviewPublicCloudMouTask(data: CreateReviewPublicCloudMouTaskData) {
  const { billing, request } = data;

  if (!billing.signed || billing.approved) {
    return null;
  }

  const taskProm = prisma.task.create({
    data: {
      type,
      status: TaskStatus.ASSIGNED,
      roles: [GlobalRole.BillingReviewer],
      data: {
        licencePlate: billing.licencePlate,
      },
    },
  });

  const emailProm = request ? sendBillingReviewerMou(request) : null;

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
