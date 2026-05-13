import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { createTeam, listTeams } from '@/services/db/team';
import { teamBodySchema } from '@/validation-schemas/team';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewTeams],
})(async ({ session }) => {
  const res = await listTeams(session);
  return Response.json(res);
});

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { body: teamBodySchema },
})(async ({ session, body }) => {
  const res = await createTeam(session, body);
  return Response.json(res);
});
