import { DEPLOYMENT_TAG, APP_ENV, IS_LOCAL, IS_DEV, IS_TEST, IS_PROD, AUTH_SERVER_URL, AUTH_RELM } from '@/config';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';

const apiHandler = createApiHandler({});
export const GET = apiHandler(async ({}) => {
  const LOGOUT_URL = `${AUTH_SERVER_URL}/realms/${AUTH_RELM}/protocol/openid-connect/logout`;

  return OkResponse({ DEPLOYMENT_TAG, APP_ENV, IS_LOCAL, IS_DEV, IS_TEST, IS_PROD, LOGOUT_URL });
});
