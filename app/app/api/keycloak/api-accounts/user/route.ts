import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import createOp from './_operations/create';
import deleteOp from './_operations/delete';
import getOp from './_operations/read';

export const GET = createApiHandler({
  roles: [GlobalRole.User],
})(async ({ session }) => {
  const res = await getOp({ session });
  return res;
});

export const POST = createApiHandler({
  roles: [GlobalRole.User],
})(async ({ session }) => {
  const res = await createOp({ session });
  return res;
});

export const DELETE = createApiHandler({
  roles: [GlobalRole.User],
})(async ({ session }) => {
  const res = await deleteOp({ session });
  return res;
});
