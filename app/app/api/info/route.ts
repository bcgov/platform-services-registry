import {
  DEPLOYMENT_TAG,
  BUILD_TIMESTAMP,
  YEARLY_UNIT_PRICE_CPU,
  YEARLY_UNIT_PRICE_STORAGE,
  APP_ENV,
  IS_LOCAL,
  IS_DEV,
  IS_TEST,
  IS_PROD,
  BASE_URL,
  AUTH_SERVER_URL,
  AUTH_RELM,
} from '@/config';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';

const apiHandler = createApiHandler({});
export const GET = apiHandler(async () => {
  const LOGOUT_URL = `${AUTH_SERVER_URL}/realms/${AUTH_RELM}/protocol/openid-connect/logout`;
  const TOKEN_URL = `${AUTH_SERVER_URL}/realms/${AUTH_RELM}/protocol/openid-connect/token`;

  return OkResponse({
    DEPLOYMENT_TAG,
    BUILD_TIMESTAMP,
    YEARLY_UNIT_PRICE_CPU,
    YEARLY_UNIT_PRICE_STORAGE,
    APP_ENV,
    IS_LOCAL,
    IS_DEV,
    IS_TEST,
    IS_PROD,
    BASE_URL,
    LOGOUT_URL,
    TOKEN_URL,
  });
});
