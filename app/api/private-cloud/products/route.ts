import createApiHandler from '@/core/api-handler';

import { NextResponse } from 'next/server';
import createOp from './_operations/create';
import listOp from './_operations/list';

export async function POST() {
  const data = await createOp();
  return NextResponse.json(data);
}

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: {},
});
export const GET = apiHandler(async ({ session }) => {
  const data = await listOp({ session });
  return NextResponse.json(data);
});
