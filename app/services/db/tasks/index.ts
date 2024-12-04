import { Task, TaskType } from '@prisma/client';
import {
  createReviewPrivateCloudRequestTask,
  CreateReviewPrivateCloudRequestTaskData,
  closeReviewPrivateCloudRequestTask,
  CloseReviewPrivateCloudRequestTaskData,
} from './review-private-cloud-request';
import {
  createReviewPublicCloudRequestTask,
  CreateReviewPublicCloudRequestTaskData,
  closeReviewPublicCloudRequestTask,
  CloseReviewPublicCloudRequestTaskData,
} from './review-public-cloud-request';

async function createTask(type: typeof TaskType.SIGN_PUBLIC_CLOUD_MOU, data: any): Promise<Task>;
async function createTask(type: typeof TaskType.REVIEW_PUBLIC_CLOUD_MOU, data: any): Promise<Task>;
async function createTask(
  type: typeof TaskType.REVIEW_PRIVATE_CLOUD_REQUEST,
  data: CreateReviewPrivateCloudRequestTaskData,
): Promise<Task>;
async function createTask(
  type: typeof TaskType.REVIEW_PUBLIC_CLOUD_REQUEST,
  data: CreateReviewPublicCloudRequestTaskData,
): Promise<Task>;
async function createTask(type: TaskType, data: any) {
  switch (type) {
    case TaskType.REVIEW_PRIVATE_CLOUD_REQUEST:
      return createReviewPrivateCloudRequestTask(data);
    case TaskType.REVIEW_PUBLIC_CLOUD_REQUEST:
      return createReviewPublicCloudRequestTask(data);
    default:
      throw new Error(`Unknown task type: ${type}`);
  }
}

async function closeTask(type: typeof TaskType.SIGN_PUBLIC_CLOUD_MOU, data: any): Promise<number>;
async function closeTask(type: typeof TaskType.REVIEW_PUBLIC_CLOUD_MOU, data: any): Promise<number>;
async function closeTask(
  type: typeof TaskType.REVIEW_PRIVATE_CLOUD_REQUEST,
  data: CloseReviewPrivateCloudRequestTaskData,
): Promise<number>;
async function closeTask(
  type: typeof TaskType.REVIEW_PUBLIC_CLOUD_REQUEST,
  data: CloseReviewPublicCloudRequestTaskData,
): Promise<number>;
async function closeTask(type: TaskType, data: any) {
  switch (type) {
    case TaskType.REVIEW_PRIVATE_CLOUD_REQUEST:
      return closeReviewPrivateCloudRequestTask(data);
    case TaskType.REVIEW_PUBLIC_CLOUD_REQUEST:
      return closeReviewPublicCloudRequestTask(data);
    default:
      throw new Error(`Unknown task type: ${type}`);
  }
}

export const tasks = {
  create: createTask,
  close: closeTask,
};
