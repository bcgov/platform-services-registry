import prisma from '@/core/prisma';

export async function readOp(licencePlate: string, commentId: string) {
  return prisma.privateCloudComment.findFirst({
    where: {
      id: commentId,
      project: {
        licencePlate: licencePlate,
      },
    },
    include: {
      user: true,
    },
  });
}
