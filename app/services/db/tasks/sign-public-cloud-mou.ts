import { TaskStatus, TaskType } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { sendExpenseAuthorityMou } from '@/services/ches/public-cloud/emails';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';

const type = TaskType.SIGN_PUBLIC_CLOUD_MOU;

export interface CreateSignPublicCloudMouTaskData {
  request: PublicCloudRequestDetailDecorated;
}

function isValidData(data: CreateSignPublicCloudMouTaskData) {
  const { request } = data;
  const { decisionData } = request;

  if (decisionData.billing?.signed || decisionData.billing?.approved) {
    return false;
  }

  return true;
}

export async function sendSignPublicCloudMouTaskEmail(data: CreateSignPublicCloudMouTaskData) {
  if (!isValidData(data)) return null;

  return sendExpenseAuthorityMou(data.request);
}

export async function createSignPublicCloudMouTask(data: CreateSignPublicCloudMouTaskData) {
  if (!isValidData(data)) return null;

  const { decisionData } = data.request;
  if (!decisionData.expenseAuthorityId) {
    return false;
  }

  const taskProm = prisma.task.create({
    data: {
      type,
      status: TaskStatus.ASSIGNED,
      userIds: [decisionData.expenseAuthorityId],
      data: {
        licencePlate: data.request.licencePlate,
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
