import { POST as _makePublicCloudRequestDecision } from '@/app/api/public-cloud/requests/[id]/decision/route';
import { POST as _reviewPublicCloudMou } from '@/app/api/public-cloud/requests/[id]/review-mou/route';
import { POST as _signPublicCloudMou } from '@/app/api/public-cloud/requests/[id]/sign-mou/route';
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

export async function signPublicCloudMou(id: string, data: { taskId: string; confirmed: boolean }) {
  const result = await requestCollectionRoute.post(_signPublicCloudMou, '/{{id}}/sign-mou', data, {
    pathParams: { id },
  });
  return result;
}

export async function reviewPublicCloudMou(id: string, data: { taskId: string; decision: string }) {
  const result = await requestCollectionRoute.post(_reviewPublicCloudMou, '/{{id}}/review-mou', data, {
    pathParams: { id },
  });
  return result;
}
