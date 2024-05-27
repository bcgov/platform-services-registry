import prisma from '@/core/prisma';

export async function createOp(text: string, userId: string, projectId?: string, requestId?: string) {
  if (!projectId && !requestId) {
    throw new Error('Either projectId or requestId must be provided');
  }

  const data: any = {
    text,
    userId,
    projectId: projectId || undefined,
    requestId: requestId || undefined,
  };

  const comment = await prisma.privateCloudComment.create({
    data,
  });

  return comment;
}
