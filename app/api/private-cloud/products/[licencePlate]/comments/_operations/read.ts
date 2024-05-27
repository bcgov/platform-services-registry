import prisma from '@/core/prisma';

export async function readOp(commentId: string) {
  const comment = await prisma.privateCloudComment.findUnique({
    where: {
      id: commentId,
    },
  });

  return comment;
}
