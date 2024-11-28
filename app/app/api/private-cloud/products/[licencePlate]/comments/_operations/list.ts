import prisma from '@/core/prisma';

export async function listOp(licencePlate: string, requestId?: string) {
  let comments;

  if (requestId === 'all') {
    const requests = await prisma.privateCloudRequest.findMany({
      where: { licencePlate },
      select: { id: true },
      distinct: ['id'],
    });

    const requestIds = requests.map((rec) => rec.id);

    comments = await prisma.privateCloudComment.findMany({
      where: { projectId: undefined, requestId: { in: requestIds } },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return comments;
  }

  // If requestId is provided, fetch comments by requestId
  if (requestId) {
    comments = await prisma.privateCloudComment.findMany({
      where: { requestId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return comments;
  }

  // Fetch the project by licencePlate
  const project = await prisma.privateCloudProject.findUnique({
    where: { licencePlate },
    select: { id: true },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  comments = await prisma.privateCloudComment.findMany({
    where: { projectId: project.id },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });

  return comments;
}
