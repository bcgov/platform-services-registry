import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import listOp from './_operations/list';

export const GET = createApiHandler({
  roles: ['user'],
})(async ({ session }) => {
  const res = await listOp({ session });
  return res;
});
