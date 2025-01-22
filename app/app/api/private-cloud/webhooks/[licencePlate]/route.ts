import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { privateCloudProductWebhookBodySchema } from '@/validation-schemas/private-cloud';
import readOp from '../_operations/read';
import updateOp from '../_operations/update';
import { getPathParamSchema, putPathParamSchema } from './schema';

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: getPathParamSchema },
})(async ({ pathParams, session }) => {
  const response = await readOp({ session, pathParams });
  return response;
});

export const PUT = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: putPathParamSchema, body: privateCloudProductWebhookBodySchema },
})(async ({ pathParams, body, session }) => {
  const response = await updateOp({ session, body, pathParams });
  return response;
});
