import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import createOp from './_operations/create';
import listOp from './_operations/list';

export async function POST() {
  const data = await createOp();
  return OkResponse(data);
}

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: {},
});
export const GET = apiHandler(async ({ session }) => {
  const data = await listOp({ session });
  return OkResponse(data);
});
