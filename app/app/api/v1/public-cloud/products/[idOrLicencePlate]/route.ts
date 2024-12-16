import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import readOp from '../_operations/read';

export const GET = createApiHandler({
  roles: ['service-account user'],
  useServiceAccount: true,
  validations: {
    pathParams: z.object({
      idOrLicencePlate: z.string().max(24),
    }),
  },
})(async ({ pathParams, session }) => {
  const { idOrLicencePlate } = pathParams;

  const response = await readOp({ session, idOrLicencePlate });
  return response;
});
