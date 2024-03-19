import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateCommentParams {
  text: string;
  projectId: string;
  userId: string;
}

export async function createOp({ text, projectId, userId }: CreateCommentParams) {
  // Create the comment with a link to the user
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
