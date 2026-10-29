import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { teamBodySchema, teamListQuerySchema } from '@/validation-schemas/team';
import createOp from './_operations/create';
import listOp from './_operations/list';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageTeams],
  validations: { body: teamBodySchema },
})(async ({ session, body }) => {
  const res = await createOp({ session, body });
  return res;
});

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewTeams],
  validations: { queryParams: teamListQuerySchema },
})(async ({ session, queryParams }) => {
  const res = await listOp({ session, includeArchived: queryParams.includeArchived });
  return res;
});
