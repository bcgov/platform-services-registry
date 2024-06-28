import { loginEvents } from '@/analytics/general/login';
import createApiHandler from '@/core/api-handler';
import { CsvResponse, NoContent } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';

const apiHandler = createApiHandler({
  permissions: [PermissionsEnum.ViewGeneralAnalytics],
});

export const GET = apiHandler(async () => {
  const data = await loginEvents();
  if (!data) return NoContent();

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
