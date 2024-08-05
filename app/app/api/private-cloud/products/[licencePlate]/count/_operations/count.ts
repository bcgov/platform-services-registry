import prisma from '@/core/prisma';

export async function getCommentCountOp(licencePlate: string, requestId?: string) {
  if (requestId) {
    const commentCount = await prisma.privateCloudComment.count({
      where: { requestId },
    });
    return { count: commentCount };
  }

  const project = await prisma.privateCloudProject.findUnique({
    where: { licencePlate },
    select: { id: true },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const commentCount = await prisma.privateCloudComment.count({
    where: { projectId: project.id },
  });

  return { count: commentCount };
}
