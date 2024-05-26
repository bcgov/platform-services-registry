import prisma from '@/core/prisma';

export async function readOp(licencePlate: string, commentId: string) {
  // A type that allows either project or request to be null
  type CommentWithProjectOrRequest = {
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      upn: string | null;
      idir: string | null;
      image: string | null;
      ministry: string | null;
      archived: boolean;
      created: Date;
      updatedAt: Date;
      lastSeen: Date | null;
    };
    project?: {
      id: string;
      licencePlate: string;
    } | null;
    request?: {
      id: string;
      licencePlate: string;
    } | null;
  };

  // Try to find the comment in the context of a project
  let comment: CommentWithProjectOrRequest | null = await prisma.privateCloudComment.findFirst({
    where: {
      id: commentId,
      project: {
        licencePlate: licencePlate,
      },
    },
    include: {
      user: true,
      project: true,
    },
  });

  // If not found, try to find the comment in the context of a request
  if (!comment) {
    comment = await prisma.privateCloudComment.findFirst({
      where: {
        id: commentId,
        request: {
          licencePlate: licencePlate,
        },
      },
      include: {
        user: true,
        request: true,
      },
    });
  }

  return comment;
}
