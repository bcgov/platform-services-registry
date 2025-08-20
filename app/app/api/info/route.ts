import {
  DEPLOYMENT_TAG,
  BUILD_TIMESTAMP,
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
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';

const apiHandler = createApiHandler({});
export const GET = apiHandler(async () => {
  const LOGOUT_URL = `${AUTH_SERVER_URL}/realms/${AUTH_RELM}/protocol/openid-connect/logout`;
  const TOKEN_URL = `${AUTH_SERVER_URL}/realms/${AUTH_RELM}/protocol/openid-connect/token`;

  const orgs = await prisma.organization.findMany();

  return OkResponse({
    DEPLOYMENT_TAG,
    BUILD_TIMESTAMP,
    APP_ENV,
    IS_LOCAL,
    IS_DEV,
    IS_TEST,
    IS_PROD,
    BASE_URL,
    LOGOUT_URL,
    TOKEN_URL,
    ORGANIZATIONS: orgs,
  });
});
