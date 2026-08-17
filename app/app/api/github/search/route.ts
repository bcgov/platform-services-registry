import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { validateGitHubUsername } from '@/services/github';

const githubUserSearchQuerySchema = z.object({
  username: z.string().trim().default(''),
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
