import { Session } from 'next-auth';
import { GlobalPermissions } from '@/constants';
import prisma from '@/core/prisma';
import { DecisionStatus, RequestType, TaskStatus, TaskType } from '@/prisma/client';
import {
  sendAdminCreateRequestEmail,
  sendAdminEditRequestEmail,
  sendAdminDeleteRequestEmail,
} from '@/services/ches/private-cloud';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';
import { RequestDecision } from '@/validation-schemas';

export const type = TaskType.REVIEW_PRIVATE_CLOUD_REQUEST;

export interface CreateTaskData {
  request: PrivateCloudRequestDetailDecorated;
  requester: string;
}

function isValidData(data: CreateTaskData) {
  if (data.request.decisionStatus !== DecisionStatus.PENDING) {
    return false;
  }

  return true;
}

export async function sendTaskEmail(data: CreateTaskData) {
  if (!isValidData(data)) return null;

  switch (data.request.type) {
    case RequestType.CREATE:
      return sendAdminCreateRequestEmail(data.request, data.requester);
    case RequestType.EDIT:
      return sendAdminEditRequestEmail(data.request, data.requester);
    case RequestType.DELETE:
      return sendAdminDeleteRequestEmail(data.request, data.requester);
  }
}

export async function createTask(data: CreateTaskData) {
  if (!isValidData(data)) return null;

  const taskProm = prisma.task.create({
    data: {
      type,
      status: TaskStatus.ASSIGNED,
      permissions: [GlobalPermissions.ReviewAllPrivateCloudRequests],
      data: {
        requestId: data.request.id,
        licencePlate: data.request.licencePlate,
      },
    },
  });

  const emailProm = sendTaskEmail(data);

  const [task] = await Promise.all([taskProm, emailProm]);
  return task;
}

export interface CloseTaskData {
  requestId: string;
  licencePlate: string;
  session: Session;
  decision: RequestDecision;
}

export async function closeTask(data: CloseTaskData) {
  const { requestId, licencePlate, session, decision } = data;

  const taskProm = prisma.task.updateMany({
    where: {
      type,
      status: { in: [TaskStatus.ASSIGNED, TaskStatus.STARTED] },
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

  const [tasks] = await Promise.all([taskProm]);
  return tasks.count;
}
