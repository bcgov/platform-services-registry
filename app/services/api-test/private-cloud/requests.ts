import { POST as _makePrivateCloudRequestDecision } from '@/app/api/private-cloud/requests/[id]/decision/route';
import { createRoute, ParamData } from '../core';

const requestCollectionRoute = createRoute('private-cloud/requests');

export async function makePrivateCloudRequestDecision(data: any, paramData?: ParamData) {
  const result = await requestCollectionRoute.post(
    _makePrivateCloudRequestDecision,
    '{{id}}/decision',
    data,
    paramData,
  );
  return result;
}
