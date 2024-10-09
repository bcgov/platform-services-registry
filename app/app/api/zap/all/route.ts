import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { privateCloudProductZapResultModel } from '@/services/db';

const apiHandler = createApiHandler({
  roles: ['admin'],
});
export const POST = apiHandler(async ({ pathParams, queryParams, body, session }) => {
  const { data: results } = await privateCloudProductZapResultModel.list(
    {
      select: { id: true, licencePlate: true, cluster: true, host: true, json: true, scannedAt: true },
    },
    session,
  );

  return OkResponse(results);
});
