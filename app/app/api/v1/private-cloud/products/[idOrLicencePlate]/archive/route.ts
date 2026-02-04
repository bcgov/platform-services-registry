import { z } from 'zod';
import deleteOp from '@/app/api/private-cloud/products/_operations/delete';
import createApiHandler from '@/core/api-handler';
import { commentSchema } from '@/validation-schemas/shared';

const apiHandler = createApiHandler({
  roles: ['service-account'],
  useServiceAccount: true,
  validations: {
    pathParams: z.object({ idOrLicencePlate: z.string().max(7) }),
    body: z.object({ requestComment: commentSchema }),
  },
});

export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { idOrLicencePlate } = pathParams;
  return deleteOp({ session, requestComment: body.requestComment, pathParams: { licencePlate: idOrLicencePlate } });
});
