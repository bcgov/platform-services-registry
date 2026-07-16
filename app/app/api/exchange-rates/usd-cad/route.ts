import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { InternalServerErrorResponse, OkResponse } from '@/core/responses';
import { fetchUsdCadExchangeRate } from '@/services/exchange-rates';

/** Shared USD→CAD rate for any registry product surface that needs FX. */
export const GET = createApiHandler({
  roles: [GlobalRole.User],
})(async () => {
  try {
    const rate = await fetchUsdCadExchangeRate();
    return OkResponse(rate);
  } catch (error) {
    return InternalServerErrorResponse((error as Error).message);
  }
});
