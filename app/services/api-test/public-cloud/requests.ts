import { POST as _makePublicCloudRequestDecision } from '@/app/api/public-cloud/requests/[id]/decision/route';
import { POST as _searchPublicCloudRequests } from '@/app/api/public-cloud/requests/search/route';
import { PublicCloudRequestSimple } from '@/types/public-cloud';
import { PublicCloudRequestDecisionBody, PublicCloudRequestSearchBody } from '@/validation-schemas/public-cloud';
import { createRoute } from '../core';

const requestCollectionRoute = createRoute('/public-cloud/requests');

export async function searchPublicCloudRequests(data: Partial<PublicCloudRequestSearchBody>) {
  const result = await requestCollectionRoute.post(_searchPublicCloudRequests, '/search', data);
  return result;
}

export async function makePublicCloudRequestDecision(id: string, data: Partial<PublicCloudRequestDecisionBody>) {
  data.isAgMinistry = false;

  const result = await requestCollectionRoute.post<
    PublicCloudRequestSimple & { success: boolean; message: string; error: any }
  >(_makePublicCloudRequestDecision, '/{{id}}/decision', data, {
    pathParams: { id },
  });
  return result;
}
