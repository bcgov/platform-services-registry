import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { archiveTeams } from '@/services/db/team';
import { bulkArchiveTeamsBodySchema } from '@/validation-schemas/team';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { body: bulkArchiveTeamsBodySchema },
})(async ({ session, body }) => {
  const res = await archiveTeams(body.ids, session);
  return OkResponse(res);
});
