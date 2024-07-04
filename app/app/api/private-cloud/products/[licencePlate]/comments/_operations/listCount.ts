import prisma from '@/core/prisma';

export async function getCommentCountsByRequestOp(licencePlate: string) {
  // Fetch all requests by licencePlate
  const requests = await prisma.privateCloudRequest.findMany({
    where: {
      licencePlate,
    },
    select: {
      id: true,
    },
  });

  if (requests.length > 0) {
    const requestIds = requests.map((request) => request.id);

    // Get comment counts grouped by requestId
    const commentCounts = await prisma.privateCloudComment.groupBy({
      by: ['requestId'],
      _count: {
        _all: true,
      },
      where: {
        requestId: {
          in: requestIds,
        },
      },
    });

    return commentCounts.reduce(
      (acc, curr) => {
        if (curr.requestId) {
          acc[curr.requestId] = curr._count._all;
        }
        return acc;
      },
      {} as { [key: string]: number },
    );
  }

  // Fetch the project by licencePlate if no requests found
  const project = await prisma.privateCloudProject.findUnique({
    where: {
      licencePlate,
    },
    select: {
      id: true,
    },
  });

  if (!project) {
    throw new Error('Project or Request not found');
  }

  // If project is found, get comment counts by request IDs associated with the project
  const commentCounts = await prisma.privateCloudComment.groupBy({
    by: ['requestId'],
    _count: {
      _all: true,
    },
    where: {
      projectId: project.id,
      requestId: {
        not: null,
      },
    },
  });

  return commentCounts.reduce(
    (acc, curr) => {
      if (curr.requestId) {
        acc[curr.requestId] = curr._count._all;
      }
      return acc;
    },
    {} as { [key: string]: number },
  );
}
