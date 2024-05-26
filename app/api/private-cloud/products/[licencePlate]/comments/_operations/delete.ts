import prisma from '@/core/prisma';

export async function deleteOp(licencePlate: string, commentId: string) {
  // Try to find and delete the comment in the context of a project
  let deletedComment = await prisma.privateCloudComment.deleteMany({
    where: {
      id: commentId,
      project: {
        licencePlate: licencePlate,
      },
    },
  });

  // If not found or deleted, try to find and delete the comment in the context of a request
  if (deletedComment.count === 0) {
    deletedComment = await prisma.privateCloudComment.deleteMany({
      where: {
        id: commentId,
        request: {
          licencePlate: licencePlate,
        },
      },
    });
  }

  return deletedComment;
}
