import prisma from '@/core/prisma';

interface UpdateCommentParams {
  licencePlate: string;
  commentId: string;
  text: string;
}

export async function updateOp({ licencePlate, commentId, text }: UpdateCommentParams) {
  const project = await prisma.privateCloudProject.findUnique({
    where: { licencePlate },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const updatedComment = await prisma.privateCloudComment.updateMany({
    where: {
      AND: [{ id: commentId }, { projectId: project.id }],
    },
    data: {
      text,
    },
  });

  if (updatedComment.count === 0) {
    throw new Error('Comment not found');
  }

  return prisma.privateCloudComment.findUnique({
    where: { id: commentId },
    include: {
      user: true,
    },
  });
}
