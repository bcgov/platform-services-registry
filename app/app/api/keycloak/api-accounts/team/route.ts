import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import createOp from './_operations/create';
import listOp from './_operations/list';

export const GET = createApiHandler({
  roles: ['user'],
})(async ({ session }) => {
  const res = await listOp({ session });
  return res;
});

export const POST = createApiHandler({
  roles: ['admin'],
  validations: {
    body: z.object({
      roles: z.string().array(),
    }),
  },
})(async ({ session, body }) => {
  const res = await createOp({ session, roles: body.roles });
  return res;
});
