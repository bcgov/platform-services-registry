import { Session } from 'next-auth';
import { GlobalPermissions } from '@/constants';
import prisma from '@/core/prisma';
import { DecisionStatus, RequestType, TaskStatus, TaskType } from '@/prisma/types';
import { sendAdminCreateRequestEmail, sendAdminDeleteRequestEmail } from '@/services/ches/public-cloud';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';
import { RequestDecision } from '@/validation-schemas';

const type = TaskType.REVIEW_PUBLIC_CLOUD_REQUEST;

export interface CreateReviewPublicCloudRequestTaskData {
  request: PublicCloudRequestDetailDecorated;
  requester: string;
}

function isValidData(data: CreateReviewPublicCloudRequestTaskData) {
  if (data.request.decisionStatus !== DecisionStatus.PENDING) {
    return false;
  }

  return true;
}

export async function sendReviewPublicCloudRequestTaskEmail(data: CreateReviewPublicCloudRequestTaskData) {
  if (!isValidData(data)) return null;

  switch (data.request.type) {
    case RequestType.CREATE:
      return sendAdminCreateRequestEmail(data.request, data.requester);
    case RequestType.DELETE:
      return sendAdminDeleteRequestEmail(data.request, data.requester);
    default:
      return null;
  }
}

export async function createReviewPublicCloudRequestTask(data: CreateReviewPublicCloudRequestTaskData) {
  if (!isValidData(data)) return null;

  const taskProm = prisma.task.create({
    data: {
      type,
      status: TaskStatus.ASSIGNED,
      permissions: [GlobalPermissions.ReviewAllPublicCloudRequests],
      data: {
        requestId: data.request.id,
        licencePlate: data.request.licencePlate,
      },
    },
  });

  const emailProm = sendReviewPublicCloudRequestTaskEmail(data);

  const [task] = await Promise.all([taskProm, emailProm]);
  return task;
}

export interface CloseReviewPublicCloudRequestTaskData {
  requestId: string;
  licencePlate: string;
  session: Session;
  decision: RequestDecision;
}

export async function closeReviewPublicCloudRequestTask(data: CloseReviewPublicCloudRequestTaskData) {
  const { requestId, licencePlate, session, decision } = data;

  const taskProm = prisma.task.updateMany({
    where: {
      type,
      status: TaskStatus.ASSIGNED,
      OR: [
        { userIds: { has: session.user.id } },
        { roles: { hasSome: session.roles } },
        { permissions: { hasSome: session.permissionList } },
      ],
      data: {
        equals: {
          requestId,
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

  const [task] = await Promise.all([taskProm]);
  return task;
}
