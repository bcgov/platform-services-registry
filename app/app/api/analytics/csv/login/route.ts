import { loginEvents } from '@/analytics/general/login';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { CsvResponse, NoContent } from '@/core/responses';

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.ViewGeneralAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await loginEvents();

  return CsvResponse(
    data.map((row) => {
      return {
        Date: row.date,
        Logins: row.Logins,
      };
    }),
    'logins.csv',
  );
});
