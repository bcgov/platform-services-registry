import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { validateGitHubUsername } from '@/services/github';

const githubUserSearchQuerySchema = z.object({
  username: z
    .string()
    .trim()
    .min(1)
    .max(39)
    .regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, 'Enter a valid GitHub username.'),
});

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: {
    queryParams: githubUserSearchQuerySchema,
  },
})(async ({ queryParams }) => {
  try {
    const result = await validateGitHubUsername(queryParams.username);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        valid: false,
        message: 'GitHub validation is temporarily unavailable.',
      },
      {
        status: 503,
      },
    );
  }
});
