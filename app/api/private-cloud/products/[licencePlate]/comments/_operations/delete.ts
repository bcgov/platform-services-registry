import prisma from '@/core/prisma';

export async function deleteOp(licencePlate: string, commentId: string) {
  const deletedComment = await prisma.privateCloudComment.delete({
    where: {
      id: commentId,
      project: {
        licencePlate: licencePlate,
      },
    },
  });

  return deletedComment;
}
