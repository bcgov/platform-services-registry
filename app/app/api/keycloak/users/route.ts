import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import listOp from './_operations/list';

export const GET = createApiHandler({
  // roles: [GlobalRole.Admin],
})(async ({ session }) => {
  const res = await listOp({ session });
  return res;
});
