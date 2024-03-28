import prisma from '@/core/prisma';

export async function listOp(licencePlate: string) {
  const comments = await prisma.privateCloudComment.findMany({
    where: {
      project: {
        licencePlate: licencePlate,
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      created: 'desc',
    },
  });
  return comments;
}
