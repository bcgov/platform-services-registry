import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse } from '@/core/responses';
import { sendGitHubAccountUpdatedEmail } from '@/services/ches/users';
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
      githubUsername: true,
      githubAccountId: true,
    },
  });

  if (!user) {
    return BadRequestResponse('Registry user was not found.');
  }

  const validation = await validateGitHubUsername(username);

  if (!validation.valid) {
    return BadRequestResponse(validation.message);
  }

  const githubUsername = validation.user.username.toLowerCase();
  const githubWasChanged =
    user.githubUsername?.toLowerCase() !== githubUsername || user.githubAccountId !== validation.user.accountId;
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
  if (githubWasChanged) {
    await sendGitHubAccountUpdatedEmail({
      email: user.email,
      firstName: user.firstName,
      githubUsername,
      previousGithubUsername: user.githubUsername,
      updatedBy: session.user.name,
    });
  }
  return OkResponse(updatedUser);
}
