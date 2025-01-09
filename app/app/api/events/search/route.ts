import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { searchEvents } from '@/services/db/event';
import { eventsSearchBodySchema } from '@/validation-schemas/event';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewEvents],
  validations: { body: eventsSearchBodySchema },
})(async ({ body }) => {
  const result = await searchEvents(body);
  return OkResponse(result);
});
