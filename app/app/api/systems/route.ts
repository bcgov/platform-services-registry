import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { createSystem, listSystems } from '@/services/db/system';
import { systemBodySchema } from '@/validation-schemas/system';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewSystems],
})(async ({ session }) => {
  const res = await listSystems(session);
  return Response.json(res);
});

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ManageSystems],
  validations: { body: systemBodySchema },
})(async ({ session, body }) => {
  const res = await createSystem(session, body);
  return Response.json(res);
});
