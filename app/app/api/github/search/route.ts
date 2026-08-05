import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateGitHubUsername } from '@/services/github';

const usernameSchema = z
  .string()
  .trim()
  .min(1)
  .max(39)
  .regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, 'Enter a valid GitHub username.');

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username');
  const parsed = usernameSchema.safeParse(username);

  if (!parsed.success) {
    return NextResponse.json(
      {
        valid: false,
        message: 'Enter a valid GitHub username.',
      },
      {
        status: 400,
      },
    );
  }

  try {
    const result = await validateGitHubUsername(parsed.data);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        valid: null,
        message: 'GitHub validation is temporarily unavailable.',
      },
      {
        status: 503,
      },
    );
  }
}
