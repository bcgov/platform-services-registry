import { Prisma, User, Task, DecisionStatus, TaskType } from '@prisma/client';

export const taskTypeNames: Record<TaskType, string> = {
  [TaskType.REVIEW_PRIVATE_CLOUD_REQUEST]: 'Review Private Cloud Request',
  [TaskType.SIGN_PUBLIC_CLOUD_MOU]: 'Sign Public Cloud MOU',
  [TaskType.REVIEW_PUBLIC_CLOUD_MOU]: 'Review Public Cloud MOU',
  [TaskType.REVIEW_PUBLIC_CLOUD_REQUEST]: 'Review Public Cloud Request',
};

export const statusColorMap: Record<any, string> = {
  [DecisionStatus.APPROVED]: 'green',
  [DecisionStatus.PROVISIONED]: 'green',
  [DecisionStatus.PARTIALLY_PROVISIONED]: 'lime',
  [DecisionStatus.CANCELLED]: 'pink',
  [DecisionStatus.REJECTED]: 'red',
  [DecisionStatus.PENDING]: 'blue',
  [DecisionStatus.AUTO_APPROVED]: 'teal',
};

export const taskSorts = [
  {
    label: 'Task creation date (new to old)',
    sortKey: 'createdAt',
    sortOrder: Prisma.SortOrder.desc,
  },
  {
    label: 'Task creation date (old to new)',
    sortKey: 'createdAt',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Task completion date (new to old)',
    sortKey: 'completedAt',
    sortOrder: Prisma.SortOrder.desc,
  },
  {
    label: 'Task completion date (old to new)',
    sortKey: 'completedAt',
    sortOrder: Prisma.SortOrder.asc,
  },
];

export interface ExtendedTask extends Task {
  user?: User | null;
}
