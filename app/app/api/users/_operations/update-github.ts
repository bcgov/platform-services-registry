import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse } from '@/core/responses';
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
    },
  });

  if (!user) {
    return BadRequestResponse('Registry user was not found.');
  }

  /*
   * TODO: Verify that the current user is allowed
   * to update this person's GitHub information.
   *
   * Use session when product-level authorization
   * requirements are finalized.
   */
  void session;

  const validation = await validateGitHubUsername(username);

  if (!validation.valid) {
    return BadRequestResponse(validation.message);
  }

  const githubUsername = validation.user.username.toLowerCase();

  const duplicateUser = await prisma.user.findFirst({
    where: {
      id: {
        not: id,
      },
      OR: [
        {
          githubUsername,
        },
        {
          githubAccountId: validation.user.accountId,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  if (duplicateUser) {
    return BadRequestResponse('This GitHub account is already associated with another Registry user.');
  }

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      githubUsername,
      githubAccountId: validation.user.accountId,
    },
    select: {
      id: true,
      githubUsername: true,
      githubAccountId: true,
    },
  });

  return OkResponse(updatedUser);
}
