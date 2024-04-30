import createApiHandler from '@/core/api-handler';
import { DEPLOYMENT_TAG, APP_ENV, IS_LOCAL, IS_DEV, IS_TEST, IS_PROD } from '@/config';
import { OkResponse } from '@/core/responses';

const apiHandler = createApiHandler({});
export const GET = apiHandler(async ({}) => {
  return OkResponse({ DEPLOYMENT_TAG, APP_ENV, IS_LOCAL, IS_DEV, IS_TEST, IS_PROD });
});
