import { Task, TaskType } from '@/prisma/client';
import * as ReviewPrivateCloudRequest from './review-private-cloud-request';
import * as ReviewPublicCloudMou from './review-public-cloud-mou';
import * as ReviewPublicCloudRequest from './review-public-cloud-request';
import * as SignPublicCloudMou from './sign-public-cloud-mou';

// This map centrally defines the data types for each task operation.
interface TaskDataMap {
  [TaskType.REVIEW_PRIVATE_CLOUD_REQUEST]: {
    create: ReviewPrivateCloudRequest.CreateTaskData;
    close: ReviewPrivateCloudRequest.CloseTaskData;
    sendEmail: ReviewPrivateCloudRequest.CreateTaskData;
  };
  [TaskType.REVIEW_PUBLIC_CLOUD_MOU]: {
    create: ReviewPublicCloudMou.CreateTaskData;
    close: ReviewPublicCloudMou.CloseTaskData;
    sendEmail: ReviewPublicCloudMou.CreateTaskData;
  };
  [TaskType.REVIEW_PUBLIC_CLOUD_REQUEST]: {
    create: ReviewPublicCloudRequest.CreateTaskData;
    close: ReviewPublicCloudRequest.CloseTaskData;
    sendEmail: ReviewPublicCloudRequest.CreateTaskData;
  };
  [TaskType.SIGN_PUBLIC_CLOUD_MOU]: {
    create: SignPublicCloudMou.CreateTaskData;
    close: SignPublicCloudMou.CloseTaskData;
    sendEmail: SignPublicCloudMou.CreateTaskData;
  };
}

// This map connects each TaskType to its imported functions.
const taskHandlers = {
  [TaskType.REVIEW_PRIVATE_CLOUD_REQUEST]: ReviewPrivateCloudRequest,
  [TaskType.REVIEW_PUBLIC_CLOUD_MOU]: ReviewPublicCloudMou,
  [TaskType.REVIEW_PUBLIC_CLOUD_REQUEST]: ReviewPublicCloudRequest,
  [TaskType.SIGN_PUBLIC_CLOUD_MOU]: SignPublicCloudMou,
};

// A type utility to infer the correct data type based on the TaskType.
type TaskDataType<T extends TaskType, K extends keyof TaskDataMap[T]> = TaskDataMap[T][K];

// These functions are now generic and rely on the `taskHandlers` map.
function getTaskHandler(type: TaskType) {
  const handler = taskHandlers[type as keyof typeof taskHandlers];
  if (!handler) {
    throw new Error(`Unknown task type: ${type}`);
  }
  return handler;
}

export function createTask<T extends TaskType>(type: T, data: TaskDataType<T, 'create'>): Promise<Task | null> {
  const handler = getTaskHandler(type);
  return handler.createTask(data as any);
}

export function closeTask<T extends TaskType>(type: T, data: TaskDataType<T, 'close'>): Promise<number> {
  const handler = getTaskHandler(type);
  return handler.closeTask(data as any);
}

export function sendTaskEmail<T extends TaskType>(type: T, data: TaskDataType<T, 'sendEmail'>): Promise<any> {
  const handler = getTaskHandler(type);
  return handler.sendTaskEmail(data as any);
}

export const tasks = {
  create: createTask,
  close: closeTask,
  sendEmail: sendTaskEmail,
};
