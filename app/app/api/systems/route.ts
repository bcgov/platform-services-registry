import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { createSystem, listSystems } from '@/services/db/system';
import { systemBodySchema } from '@/validation-schemas/system';

const queryParamsSchema = z.object({
  includeArchived: z
    .preprocess((value) => value === 'true' || value === '1' || value === true, z.boolean())
    .optional()
    .default(false),
});

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewSystems],
  validations: { queryParams: queryParamsSchema },
})(async ({ session, queryParams }) => {
  const res = await listSystems(session, { includeArchived: queryParams.includeArchived });
  return Response.json(res);
});

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageSystems],
  validations: { body: systemBodySchema },
})(async ({ session, body }) => {
  const res = await createSystem(session, body);
  return Response.json(res);
});
