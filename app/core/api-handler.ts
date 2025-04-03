import _compact from 'lodash-es/compact';
import _trim from 'lodash-es/trim';
import _uniq from 'lodash-es/uniq';
import { NextRequest, NextResponse } from 'next/server';
import { Session, PermissionsKey } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { z, TypeOf, ZodType } from 'zod';
import { AUTH_SERVER_URL, AUTH_RELM, IS_LOCAL, IS_TEST } from '@/config';
import { GlobalRole } from '@/constants';
import { authOptions, generateSession } from '@/core/auth-options';
import { findUser } from '@/services/keycloak/app-realm';
import { checkArrayStringCondition, parseQueryString } from '@/utils/js';
import { verifyKeycloakJwtTokenSafe, parseKeycloakJwtTokenSafe } from '@/utils/node';
import { logger } from './logging';
import {
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  NotFoundResponse,
  InternalServerErrorResponse,
  OkResponse,
} from './responses';

const verifyKeycloakJwtToken = IS_LOCAL || IS_TEST ? parseKeycloakJwtTokenSafe : verifyKeycloakJwtTokenSafe;

interface HandlerProps<TPathParams, TQueryParams, TBody> {
  roles?: string[];
  permissions?: PermissionsKey[];
  validations?: {
    pathParams?: TPathParams;
    queryParams?: TQueryParams;
    body?: TBody;
  };
  keycloakOauth2?: {
    authUrl?: string;
    realm?: string;
    clientId?: string;
    requiredClaims?: string[];
  };
  useServiceAccount?: boolean;
}

interface RouteProps<TPathParams, TQueryParams, TBody> {
  session: Session;
  pathParams: TPathParams;
  queryParams: TQueryParams;
  body: TBody;
  headers: Headers;
  jwtData: any;
}

function createApiHandler<
  TPathParams extends ZodType<any, any>,
  TQueryParams extends ZodType<any, any>,
  TBody extends ZodType<any, any>,
>({
  roles,
  permissions,
  validations,
  keycloakOauth2,
  useServiceAccount,
}: HandlerProps<TPathParams, TQueryParams, TBody>) {
  const {
    pathParams: pathParamVal = z.object({}),
    queryParams: queryParamVal = z.object({}),
    body: bodyVal = z.object({}),
  } = validations ?? {};
  let pathParams: TypeOf<typeof pathParamVal> | null = null;
  let queryParams: TypeOf<typeof queryParamVal> | null = null;
  let body: TypeOf<typeof bodyVal> | null = null;

  return function apiHandler(
    fn: (
      props: RouteProps<TypeOf<TPathParams>, TypeOf<TQueryParams>, TypeOf<TBody>>,
    ) => Promise<NextResponse<unknown> | Response>,
  ) {
    return async function (req: NextRequest, context: any) {
      const { params: paramsProm } = context ?? {};
      const params = paramsProm && (await paramsProm);

      try {
        let session = await getServerSession(authOptions);
        let jwtData!: any;

        if (!session) {
          console.log('there is no session here');
          if (keycloakOauth2) {
            const bearerToken = req.headers.get('authorization');
            if (!bearerToken) {
              return UnauthorizedResponse('not allowed to perform the task');
            }

            const { authUrl = AUTH_SERVER_URL, realm = AUTH_RELM, clientId, requiredClaims } = keycloakOauth2;

            jwtData = await verifyKeycloakJwtToken({
              jwtToken: bearerToken,
              authUrl,
              realm,
              authorizedPresenter: clientId,
              requiredClaims,
            });

            if (!jwtData) {
              return UnauthorizedResponse('invalid token');
            }
          } else if (useServiceAccount) {
            const bearerToken = req.headers.get('authorization');
            if (!bearerToken) {
              return UnauthorizedResponse('not allowed to perform the task');
            }

            console.log('bearerToken: ', bearerToken);

            jwtData = await verifyKeycloakJwtToken({
              jwtToken: bearerToken,
              authUrl: AUTH_SERVER_URL,
              realm: AUTH_RELM,
              requiredClaims: ['service_account_type'],
            });

            if (!jwtData) {
              return UnauthorizedResponse('invalid token');
            }

            const saType = jwtData.service_account_type;

            console.log('satype: ', saType);

            if (saType === 'user') {
              const kcUserId = jwtData['kc-userid'];
              if (!kcUserId) return UnauthorizedResponse('invalid token');

              const kcUser = await findUser(kcUserId);
              if (!kcUser) return BadRequestResponse('keycloak user not found');

              session = await generateSession({
                session: {} as Session,
                token: {
                  email: kcUser.email,
                },
                userSession: {
                  email: kcUser.email ?? '',
                  roles: kcUser.authRoleNames.concat(GlobalRole.ServiceAccount),
                  teams: [],
                  sub: '',
                  accessToken: '',
                  refreshToken: '',
                  idToken: '',
                },
              });
            } else if (saType === 'team') {
              const rolesStr = jwtData.roles;
              const rolesArr: string[] = _uniq(_compact(rolesStr.split(',').map(_trim)));

              session = await generateSession({
                session: {} as Session,
                token: {
                  email: '',
                },
                userSession: {
                  email: '',
                  roles: rolesArr.concat(GlobalRole.ServiceAccount),
                  teams: [],
                  sub: '',
                  accessToken: '',
                  refreshToken: '',
                  idToken: '',
                },
              });
            } else {
              return UnauthorizedResponse('invalid token');
            }
          }
        }

        if (!session) session = await generateSession({ session: {} as Session });

        // Validate user roles
        if (roles && roles.length > 0) {
          const allowed = checkArrayStringCondition(roles, session.roles);

          if (!allowed) {
            return UnauthorizedResponse('not allowed to perform the task');
          }
        }

        // Validate user permissions
        if (permissions && permissions.length > 0) {
          const allowed = permissions.some(
            (permKey) => session.permissions[permKey as keyof typeof session.permissions],
          );
          if (!allowed) {
            return UnauthorizedResponse('not allowed to perform the task');
          }
        }

        // Parse & validate path params
        if (validations?.pathParams) {
          const parsed = validations?.pathParams.safeParse(params);
          if (!parsed.success) {
            return BadRequestResponse(parsed.error);
          }

          pathParams = parsed.data;
        }

        // Parse & validate query params
        if (validations?.queryParams) {
          const query = parseQueryString(req.nextUrl.search);
          const parsed = validations?.queryParams.safeParse(query);
          if (!parsed.success) {
            return BadRequestResponse(parsed.error);
          }

          queryParams = parsed.data;
        }

        // Parse & validate request data
        if (validations?.body) {
          let json;
          let failed = false;
          try {
            json = await req.json();
          } catch {
            failed = true;
          }

          if (failed) {
            return BadRequestResponse('invalid request data');
          }

          const parsed = validations?.body.safeParse(json);
          if (!parsed.success) {
            return BadRequestResponse(parsed.error);
          }

          body = parsed.data;
        }

        return await fn({ session, pathParams, queryParams, body, headers: req.headers, jwtData });
      } catch (error) {
        logger.error('apiHandler:', error);
        return InternalServerErrorResponse(String(error));
      }
    };
  };
}

export default createApiHandler;
