import prisma from '@/core/prisma';

interface CreateCommentParams {
  text: string;
  projectId: string;
  userId: string;
}

export async function createOp({ text, projectId, userId }: CreateCommentParams) {
  const comment = await prisma.privateCloudComment.create({
    data: {
      text,
      user: {
        connect: {
          id: userId,
        },
      },
      project: {
        connect: {
          id: projectId,
        },
      },
    },
  });

  return comment;
}
