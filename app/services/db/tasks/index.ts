import { Task, TaskType } from '@/prisma/client';
import {
  sendReviewPrivateCloudRequestTaskEmail,
  createReviewPrivateCloudRequestTask,
  CreateReviewPrivateCloudRequestTaskData,
  closeReviewPrivateCloudRequestTask,
  CloseReviewPrivateCloudRequestTaskData,
} from './review-private-cloud-request';
import {
  sendReviewPublicCloudMouTaskEmail,
  createReviewPublicCloudMouTask,
  CreateReviewPublicCloudMouTaskData,
  closeReviewPublicCloudMouTask,
  CloseReviewPublicCloudMouTaskData,
} from './review-public-cloud-mou';
import {
  sendReviewPublicCloudRequestTaskEmail,
  createReviewPublicCloudRequestTask,
  CreateReviewPublicCloudRequestTaskData,
  closeReviewPublicCloudRequestTask,
  CloseReviewPublicCloudRequestTaskData,
} from './review-public-cloud-request';
import {
  sendSignPublicCloudMouTaskEmail,
  createSignPublicCloudMouTask,
  CreateSignPublicCloudMouTaskData,
  closeSignPublicCloudMouTask,
  CloseSignPublicCloudMouTaskData,
} from './sign-public-cloud-mou';

async function sendTaskEmail(
  type: typeof TaskType.REVIEW_PRIVATE_CLOUD_REQUEST,
  data: CreateReviewPrivateCloudRequestTaskData,
): Promise<any>;
async function sendTaskEmail(
  type: typeof TaskType.REVIEW_PUBLIC_CLOUD_REQUEST,
  data: CreateReviewPublicCloudRequestTaskData,
): Promise<any>;
async function sendTaskEmail(
  type: typeof TaskType.SIGN_PUBLIC_CLOUD_MOU,
  data: CreateSignPublicCloudMouTaskData,
): Promise<any>;
async function sendTaskEmail(
  type: typeof TaskType.REVIEW_PUBLIC_CLOUD_MOU,
  data: CreateReviewPublicCloudMouTaskData,
): Promise<any>;
async function sendTaskEmail(type: TaskType, data: any) {
  switch (type) {
    case TaskType.REVIEW_PRIVATE_CLOUD_REQUEST:
      return sendReviewPrivateCloudRequestTaskEmail(data);
    case TaskType.REVIEW_PUBLIC_CLOUD_REQUEST:
      return sendReviewPublicCloudRequestTaskEmail(data);
    case TaskType.SIGN_PUBLIC_CLOUD_MOU:
      return sendSignPublicCloudMouTaskEmail(data);
    case TaskType.REVIEW_PUBLIC_CLOUD_MOU:
      return sendReviewPublicCloudMouTaskEmail(data);
    default:
      throw new Error(`Unknown task type: ${type}`);
  }
}

async function createTask(
  type: typeof TaskType.REVIEW_PRIVATE_CLOUD_REQUEST,
  data: CreateReviewPrivateCloudRequestTaskData,
): Promise<Task>;
async function createTask(
  type: typeof TaskType.REVIEW_PUBLIC_CLOUD_REQUEST,
  data: CreateReviewPublicCloudRequestTaskData,
): Promise<Task>;
async function createTask(
  type: typeof TaskType.SIGN_PUBLIC_CLOUD_MOU,
  data: CreateSignPublicCloudMouTaskData,
): Promise<Task>;
async function createTask(
  type: typeof TaskType.REVIEW_PUBLIC_CLOUD_MOU,
  data: CreateReviewPublicCloudMouTaskData,
): Promise<Task>;
async function createTask(type: TaskType, data: any) {
  switch (type) {
    case TaskType.REVIEW_PRIVATE_CLOUD_REQUEST:
      return createReviewPrivateCloudRequestTask(data);
    case TaskType.REVIEW_PUBLIC_CLOUD_REQUEST:
      return createReviewPublicCloudRequestTask(data);
    case TaskType.SIGN_PUBLIC_CLOUD_MOU:
      return createSignPublicCloudMouTask(data);
    case TaskType.REVIEW_PUBLIC_CLOUD_MOU:
      return createReviewPublicCloudMouTask(data);
    default:
      throw new Error(`Unknown task type: ${type}`);
  }
}

async function closeTask(
  type: typeof TaskType.REVIEW_PRIVATE_CLOUD_REQUEST,
  data: CloseReviewPrivateCloudRequestTaskData,
): Promise<number>;
async function closeTask(
  type: typeof TaskType.REVIEW_PUBLIC_CLOUD_REQUEST,
  data: CloseReviewPublicCloudRequestTaskData,
): Promise<number>;
async function closeTask(
  type: typeof TaskType.SIGN_PUBLIC_CLOUD_MOU,
  data: CloseSignPublicCloudMouTaskData,
): Promise<number>;
async function closeTask(
  type: typeof TaskType.REVIEW_PUBLIC_CLOUD_MOU,
  data: CloseReviewPublicCloudMouTaskData,
): Promise<number>;
async function closeTask(type: TaskType, data: any) {
  switch (type) {
    case TaskType.REVIEW_PRIVATE_CLOUD_REQUEST:
      return closeReviewPrivateCloudRequestTask(data);
    case TaskType.REVIEW_PUBLIC_CLOUD_REQUEST:
      return closeReviewPublicCloudRequestTask(data);
    case TaskType.SIGN_PUBLIC_CLOUD_MOU:
      return closeSignPublicCloudMouTask(data);
    case TaskType.REVIEW_PUBLIC_CLOUD_MOU:
      return closeReviewPublicCloudMouTask(data);
    default:
      throw new Error(`Unknown task type: ${type}`);
  }
}

export const tasks = {
  sendEmail: sendTaskEmail,
  create: createTask,
  close: closeTask,
};
