import prisma from '@/core/prisma';

export async function createOp(text: string, projectId: string, userId: string) {
  const comment = await prisma.privateCloudComment.create({
    data: {
      text,
      userId,
      projectId,
    },
  });

  return comment;
}
