import { POST as _makePrivateCloudRequestDecision } from '@/app/api/private-cloud/requests/[id]/decision/route';
import { createRoute } from '../core';

const requestCollectionRoute = createRoute('/private-cloud/requests');

export async function makePrivateCloudRequestDecision(id: string, data: any) {
  const result = await requestCollectionRoute.post(_makePrivateCloudRequestDecision, '/{{id}}/decision', data, {
    pathParams: { id },
  });
  return result;
}
