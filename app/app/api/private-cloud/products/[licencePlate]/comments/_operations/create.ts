import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '@/core/prisma';
import { BadRequestError } from '@/utils/errors';

export async function createOp(text: string, userId: string, projectId?: string, requestId?: string) {
  if (!projectId && !requestId) {
    throw new Error('Either projectId or requestId must be provided');
  }

  const data: any = {
    text,
    userId,
    projectId: projectId || undefined,
    requestId: requestId || undefined,
  };

  try {
    const comment = await prisma.privateCloudComment.create({
      data,
    });

    return comment;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2023') {
      throw new BadRequestError('Bad Request');
    }
    throw error;
  }
}
