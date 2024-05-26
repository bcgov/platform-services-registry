import prisma from '@/core/prisma';

export async function listOp(licencePlate: string, requestId?: string) {
  let comments;

  if (requestId) {
    comments = await prisma.privateCloudComment.findMany({
      where: {
        requestId,
      },
      include: {
        user: true, // Include related user information if needed
      },
    });
  } else {
    comments = await prisma.privateCloudComment.findMany({
      where: {
        project: {
          licencePlate,
        },
      },
      include: {
        user: true, // Include related user information if needed
      },
    });
  }

  return comments;
}
