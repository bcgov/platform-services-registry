import { POST as _searchPrivateCloudRequests } from '@/app/api/v1/private-cloud/requests/search/route';
import { PrivateCloudRequestSearchBody } from '@/validation-schemas/private-cloud';
import { createRoute } from '../../core';

const requestCollectionRoute = createRoute('/v1/private-cloud/requests');

export async function searchPrivateCloudRequestsApi(
  data: Partial<PrivateCloudRequestSearchBody> = {},
  withToken = true,
) {
  return requestCollectionRoute.post(
    _searchPrivateCloudRequests,
    '/search',
    data,
    undefined,
    withToken ? { Authorization: 'Bearer test-token' } : undefined,
  );
}
