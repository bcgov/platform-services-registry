import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { Prisma } from '@/prisma/client';
import { sendGitHubAccountUpdatedEmail } from '@/services/ches/users';
import { usersShareActiveProduct } from '@/services/db';
import { validateGitHubUsername } from '@/services/github';
import { githubUserUpdateBodySchema, putPathParamSchema } from '../[id]/schema';

export default async function updateGitHubOp({
  session,
  body,
  pathParams,
}: {
  session: Session;
  body: TypeOf<typeof githubUserUpdateBodySchema>;
  pathParams: TypeOf<typeof putPathParamSchema>;
}) {
  const { id } = pathParams;
  const { username } = body;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      githubAccount: {
        select: {
          username: true,
          accountId: true,
        },
      },
    },
  });

  if (!user) {
    return BadRequestResponse('Registry user was not found.');
  }
  const isEditingSelf = session.user.id === id;
  const canEditAnyUser = session.permissions.editUsers;
  const canEditProductMember =
    isEditingSelf || canEditAnyUser ? false : await usersShareActiveProduct(session.user.id, id);

  if (!isEditingSelf && !canEditAnyUser && !canEditProductMember) {
    return UnauthorizedResponse();
  }

  const validation = await validateGitHubUsername(username);

  if (!validation.valid) {
    return BadRequestResponse(validation.message);
  }

  const githubUsername = validation.user.username.toLowerCase();
  const githubAccountId = validation.user.accountId;

  const githubWasChanged =
    user.githubAccount?.username?.toLowerCase() !== githubUsername || user.githubAccount?.accountId !== githubAccountId;

  const duplicateUser = await prisma.user.findFirst({
    where: {
      id: {
        not: id,
      },
      githubAccount: {
        is: {
          OR: [
            {
              username: githubUsername,
            },
            {
              accountId: githubAccountId,
            },
          ],
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  if (duplicateUser) {
    const canViewDuplicateUser = canEditAnyUser || (await usersShareActiveProduct(session.user.id, duplicateUser.id));

    if (canViewDuplicateUser) {
      const fullName = [duplicateUser.firstName, duplicateUser.lastName].filter(Boolean).join(' ');

      const userLabel = fullName || duplicateUser.email;

      return BadRequestResponse(`This GitHub account is already associated with ${userLabel}.`);
    }

    return BadRequestResponse('This GitHub account is already associated with another Registry user.');
  }

  let updatedUser;

  try {
    updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        githubAccount: {
          upsert: {
            create: {
              username: githubUsername,
              accountId: githubAccountId,
            },
            update: {
              username: githubUsername,
              accountId: githubAccountId,
            },
          },
        },
      },
      select: {
        id: true,
        githubAccount: {
          select: {
            username: true,
            accountId: true,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return BadRequestResponse('This GitHub account is already associated with another Registry user.');
    }

    throw error;
  }
  if (githubWasChanged) {
    await sendGitHubAccountUpdatedEmail({
      email: user.email,
      firstName: user.firstName,
      githubUsername,
      previousGithubUsername: user.githubAccount?.username ?? null,
      updatedBy: session.user.name,
    });
  }
  return OkResponse(updatedUser);
}
