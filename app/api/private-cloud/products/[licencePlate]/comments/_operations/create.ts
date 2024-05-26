import prisma from '@/core/prisma';

export async function createOp(text: string, userId: string, projectId?: string, requestId?: string) {
  if (!projectId && !requestId) {
    throw new Error('Either projectId or requestId must be provided');
  }

  const data: any = {
    text,
    user: {
      connect: { id: userId },
    },
  };

  if (projectId) {
    data.project = { connect: { id: projectId } };
  }

  if (requestId) {
    data.request = { connect: { id: requestId } };
  }

  const comment = await prisma.privateCloudComment.create({
    data,
  });

  return comment;
}
