import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { searchEvents } from '@/services/db';
import { formatDate } from '@/utils/js';
import { eventsSearchBodySchema } from '@/validation-schemas/event';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewUsers],
  validations: { body: eventsSearchBodySchema },
})(async ({ session, body }) => {
  const searchProps = {
    ...body,
    page: 1,
    pageSize: 10000,
  };

  const { data, totalCount } = await searchEvents(searchProps);

  if (data.length === 0) {
    return NoContent();
  }

  const formattedData = data.map((event) => ({
    Event: event.type,
    'User email': event.user?.email,
    Title: event.user?.jobTitle,
    'Event created': formatDate(event.createdAt),
  }));

  return CsvResponse(formattedData, 'events.csv');
});
