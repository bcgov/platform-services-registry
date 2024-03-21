import { NextRequest, NextResponse } from 'next/server';
import { Session, PermissionsKey } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions, generateSession } from '@/core/auth-options';
import { z, TypeOf, ZodType } from 'zod';
import { parseQueryString } from '@/utils/query-string';
import { verifyKeycloakJwtTokenSafe } from '@/types/jwt';
import {
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  NotFoundResponse,
  InternalServerErrorResponse,
  OkResponse,
} from './responses';
import { AUTH_BASE_URL, AUTH_RELM } from '@/config';

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
    clientId: string;
  };
}

interface RouteProps<TPathParams, TQueryParams, TBody> {
  session: Session;
  pathParams: TPathParams;
  queryParams: TQueryParams;
  body: TBody;
  headers: Headers;
}

function arrayIntersection(arr1: string[], arr2: string[]) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return [];
  }
  const set2 = new Set(arr2);
  if (set2 instanceof Set) {
    const intersection = arr1.filter((value) => set2.has(value));
    return intersection;
  }

  return [];
}

function createApiHandler<
  TPathParams extends ZodType<any, any>,
  TQueryParams extends ZodType<any, any>,
  TBody extends ZodType<any, any>,
>({ roles, permissions, validations, keycloakOauth2 }: HandlerProps<TPathParams, TQueryParams, TBody>) {
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
    return async function (
      req: NextRequest,
      { params }: { params: TypeOf<TPathParams> } = { params: {} as TypeOf<TPathParams> },
    ) {
      try {
        let session!: Session;
        if (keycloakOauth2) {
          const bearerToken = req.headers.get('authorization');
          if (!bearerToken) {
            return UnauthorizedResponse('not allowed to perform the task');
          }

          const { authUrl = AUTH_BASE_URL, realm = AUTH_RELM, clientId } = keycloakOauth2;

          const payload = await verifyKeycloakJwtTokenSafe({
            jwtToken: bearerToken,
            authUrl,
            realm,
            authorizedPresenter: clientId,
          });

          if (!payload) {
            return UnauthorizedResponse('invalid token');
          }
        } else {
          session = (await getServerSession(authOptions)) || (await generateSession({ session: {} as Session }));

          // Validate user roles
          if (roles && roles.length > 0) {
            const allowed = arrayIntersection(roles, session.roles).length > 0;
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
        }

        // Parse & validate path params
        if (validations?.pathParams) {
          const parsed = validations?.pathParams.safeParse(params);
          if (!parsed.success) {
            return BadRequestResponse(String(parsed.error));
          }

          pathParams = parsed.data;
        }

        // Parse & validate query params
        if (validations?.queryParams) {
          const query = parseQueryString(req.nextUrl.search);
          const parsed = validations?.queryParams.safeParse(query);
          if (!parsed.success) {
            return BadRequestResponse(String(parsed.error));
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
            return BadRequestResponse(String(parsed.error));
          }

          body = parsed.data;
        }

        return await fn({ session, pathParams, queryParams, body, headers: req.headers });
      } catch (error) {
        console.error(error);
        return InternalServerErrorResponse(String(error));
      }
    };
  };
}

export default createApiHandler;
