import prisma from '@/core/prisma';

export async function deleteOp(commentId: string) {
  const deletedComment = await prisma.privateCloudComment.delete({
    where: {
      id: commentId,
    },
  });

  return deletedComment;
}
