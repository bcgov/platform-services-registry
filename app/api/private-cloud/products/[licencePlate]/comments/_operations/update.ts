import prisma from '@/core/prisma';

export async function updateOp(commentId: string, text: string) {
  const updatedComment = await prisma.privateCloudComment.update({
    where: {
      id: commentId,
    },
    data: {
      text: text,
    },
    include: {
      user: true,
    },
  });

  return updatedComment;
}
