import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { loginEvents } from '@/services/db/analytics-general-logins';
import { loginsSearchBodySchema } from '@/validation-schemas/logins';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewGeneralAnalytics],
  validations: { body: loginsSearchBodySchema },
})(async ({ body }) => {
  const result = await loginEvents(body);
  return OkResponse(result);
});
