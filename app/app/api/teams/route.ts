import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { createTeam, listTeams } from '@/services/db/team';
import { teamBodySchema } from '@/validation-schemas/team';

const queryParamsSchema = z.object({
  includeArchived: z
    .preprocess((value) => value === 'true' || value === '1' || value === true, z.boolean())
    .optional()
    .default(false),
});

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewTeams],
  validations: { queryParams: queryParamsSchema },
})(async ({ session, queryParams }) => {
  const res = await listTeams(session, { includeArchived: queryParams.includeArchived });
  return Response.json(res);
});

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { body: teamBodySchema },
})(async ({ session, body }) => {
  const res = await createTeam(session, body);
  return Response.json(res);
});
