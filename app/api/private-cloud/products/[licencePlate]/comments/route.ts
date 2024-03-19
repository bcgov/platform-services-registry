import { NextResponse } from 'next/server';
import createApiHandler from '@/core/api-handler';
import { createOp } from './_operations/create';
import listOp from './_operations/list';
import { z } from 'zod';

const CreateCommentBodySchema = z.object({
  text: z.string().min(1, 'The comment text must not be empty'),
  projectId: z.string(),
});

export const POST = createApiHandler({
  roles: ['admin'],
  validations: {
    body: CreateCommentBodySchema,
  },
})(async ({ session, body }) => {
  console.log(session);
  if (!session) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const userId = session!.userId!;

  const comment = await createOp({ text: body.text, projectId: body.projectId, userId });
  return new NextResponse(JSON.stringify(comment), { status: 201 });
});

export async function GET() {
  const data = await listOp();
  return NextResponse.json(data);
}
