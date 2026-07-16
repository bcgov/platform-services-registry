import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { InternalServerErrorResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { fetchUsdCadExchangeRate } from '@/services/bank-of-canada/usd-cad-rate';

export const GET = createApiHandler({
  roles: [GlobalRole.User],
})(async ({ session }) => {
  if (!session.previews.publicCloudForecast) {
    return UnauthorizedResponse();
  }

  try {
    const rate = await fetchUsdCadExchangeRate();
    return OkResponse(rate);
  } catch (error) {
    return InternalServerErrorResponse((error as Error).message);
  }
});
