import prisma from '@/core/prisma';

export async function updateOp(commentId: string, text: string) {
  const updatedComment = await prisma.privateCloudComment.update({
    where: {
      id: commentId,
    },
    data: {
      text: text,
    },
  });

  const comment = await prisma.privateCloudComment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      user: true,
    },
  });

  return updatedComment;
}
