import prisma from '@/core/prisma';

export async function listOp(licencePlate: string, requestId?: string) {
  let comments;

  // If requestId is provided, fetch comments by requestId
  if (requestId) {
    comments = await prisma.privateCloudComment.findMany({
      where: {
        requestId,
      },
      include: {
        user: true,
      },
    });

    if (comments.length > 0) {
      return comments;
    }
  }

  // Fetch the project by licencePlate
  const project = await prisma.privateCloudProject.findUnique({
    where: {
      licencePlate,
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  comments = await prisma.privateCloudComment.findMany({
    where: {
      projectId: project.id,
    },
    include: {
      user: true,
    },
  });

  return comments;
}
