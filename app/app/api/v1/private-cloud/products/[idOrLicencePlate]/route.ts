import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import readOp from '../_operations/read';

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: {
    pathParams: z.object({
      idOrLicencePlate: z.string().max(24),
    }),
  },
})(async ({ pathParams, session }) => {
  const { idOrLicencePlate } = pathParams;

  const result = await readOp({ session, idOrLicencePlate });
  return OkResponse(result);
});
