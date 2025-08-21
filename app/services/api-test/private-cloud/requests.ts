import { POST as _makePrivateCloudRequestDecision } from '@/app/api/private-cloud/requests/[id]/decision/route';
import { POST as _searchPrivateCloudRequests } from '@/app/api/private-cloud/requests/search/route';
import { PrivateCloudRequestSimple } from '@/types/private-cloud';
import { PrivateCloudRequestDecisionBody, PrivateCloudRequestSearchBody } from '@/validation-schemas/private-cloud';
import { createRoute } from '../core';

const requestCollectionRoute = createRoute('/private-cloud/requests');

export async function makePrivateCloudRequestDecision(id: string, data: Partial<PrivateCloudRequestDecisionBody>) {
  data.isAgMinistry = false;

  const result = await requestCollectionRoute.post<
    PrivateCloudRequestSimple & { success: boolean; message: string; error: any }
  >(_makePrivateCloudRequestDecision, '/{{id}}/decision', data, {
    pathParams: { id },
  });
  return result;
}

export async function searchPrivateCloudRequests(data: Partial<PrivateCloudRequestSearchBody>) {
  const result = await requestCollectionRoute.post(_searchPrivateCloudRequests, '/search', data);
  return result;
}
