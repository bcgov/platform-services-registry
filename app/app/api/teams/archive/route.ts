import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { teamArchiveBodySchema } from '@/validation-schemas/team';
import archiveOp from '../_operations/archive';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { body: teamArchiveBodySchema },
})(async ({ session, body }) => {
  const res = await archiveOp({ session, ids: body.ids });
  return res;
});
