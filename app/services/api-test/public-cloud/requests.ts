import { POST as _makePublicCloudRequestDecision } from '@/app/api/public-cloud/requests/[id]/decision/route';
import { POST as _searchPublicCloudRequests } from '@/app/api/public-cloud/requests/search/route';
import { PublicCloudRequestSearchBody } from '@/validation-schemas/public-cloud';
import { createRoute } from '../core';

const requestCollectionRoute = createRoute('/public-cloud/requests');

export async function searchPublicCloudRequests(data: Partial<PublicCloudRequestSearchBody>) {
  const result = await requestCollectionRoute.post(_searchPublicCloudRequests, '/search', data);
  return result;
}

export async function makePublicCloudRequestDecision(id: string, data: any) {
  const result = await requestCollectionRoute.post(_makePublicCloudRequestDecision, '/{{id}}/decision', data, {
    pathParams: { id },
  });
  return result;
}
