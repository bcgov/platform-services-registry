import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { archiveSystems } from '@/services/db/system';
import { bulkArchiveSystemsBodySchema } from '@/validation-schemas/system';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageSystems],
  validations: { body: bulkArchiveSystemsBodySchema },
})(async ({ session, body }) => {
  const res = await archiveSystems(body.ids, session);
  return OkResponse(res);
});
