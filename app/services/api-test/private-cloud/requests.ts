import { POST as _makePrivateCloudRequestDecision } from '@/app/api/private-cloud/requests/[id]/decision/route';
import { POST as _searchPrivateCloudRequests } from '@/app/api/private-cloud/requests/search/route';
import { PrivateCloudRequestSearchBody } from '@/validation-schemas/private-cloud';
import { createRoute } from '../core';

const requestCollectionRoute = createRoute('/private-cloud/requests');

export async function makePrivateCloudRequestDecision(id: string, data: any) {
  const result = await requestCollectionRoute.post(_makePrivateCloudRequestDecision, '/{{id}}/decision', data, {
    pathParams: { id },
  });
  return result;
}

export async function searchPrivateCloudRequests(data: Partial<PrivateCloudRequestSearchBody>) {
  const result = await requestCollectionRoute.post(_searchPrivateCloudRequests, '/search', data);
  return result;
}
