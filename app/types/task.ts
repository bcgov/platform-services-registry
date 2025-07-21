import { Prisma } from '@/prisma/client';

export type SearchTask = Prisma.TaskGetPayload<{
  select: {
    id: true;
    closedMetadata: true;
    completedAt: true;
    completedBy: true;
    createdAt: true;
    data: true;
    permissions: true;
    roles: true;
    status: true;
    type: true;
    userIds: true;
    completedByUser: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        ministry: true;
        jobTitle: true;
        image: true;
        upn: true;
        idir: true;
      };
    };
  };
}> & {
  users: {
    id: string;
    image: string;
    ministry: string;
    email: string;
    firstName: string;
    lastName: string;
    idir: string | null;
    upn: string | null;
  }[];
};

export type AssignedTask = Prisma.TaskGetPayload<{
  include: {
    startedByUser: {
      select: { id: true; email: true };
    };
  };
}> & {
  link: string;
  description: string;
};
