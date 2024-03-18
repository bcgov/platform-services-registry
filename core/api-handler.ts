import { NextRequest, NextResponse } from 'next/server';
import { Session, PermissionsKey } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/core/auth-options';
import { z, TypeOf, ZodType } from 'zod';
import { parseQueryString } from '@/utils/query-string';

interface HandlerProps<TPathParams, TQueryParams, TBody> {
  roles?: string[];
  permissions?: PermissionsKey[];
  validations?: {
    pathParams?: TPathParams;
    queryParams?: TQueryParams;
    body?: TBody;
  };
}

interface RouteProps<TPathParams, TQueryParams, TBody> {
  session: Session | null;
  pathParams: TPathParams;
  queryParams: TQueryParams;
  body: TBody;
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
>({ roles, permissions, validations }: HandlerProps<TPathParams, TQueryParams, TBody>) {
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
        const session = await getServerSession(authOptions);

        // Validate user roles
        if (roles && roles.length > 0) {
          const allowed = session && arrayIntersection(roles, session.roles).length > 0;
          if (!allowed) {
            return NextResponse.json(
              { message: 'Unauthorized', error: 'not allowed to perform the task' },
              { status: 401 },
            );
          }
        }

        // Validate user permissions
        if (permissions && permissions.length > 0) {
          const allowed =
            session && permissions.some((permKey) => session.permissions[permKey as keyof typeof session.permissions]);
          if (!allowed) {
            return NextResponse.json(
              { message: 'Unauthorized', error: 'not allowed to perform the task' },
              { status: 401 },
            );
          }
        }

        // Parse & validate path params
        if (validations?.pathParams) {
          const parsed = validations?.pathParams.safeParse(params);
          if (!parsed.success) {
            return NextResponse.json({ message: 'Bad Request', error: parsed.error }, { status: 400 });
          }

          pathParams = parsed.data;
        }

        // Parse & validate query params
        if (validations?.queryParams) {
          const query = parseQueryString(req.nextUrl.search);
          const parsed = validations?.queryParams.safeParse(query);
          if (!parsed.success) {
            return NextResponse.json({ message: 'Bad Request', error: parsed.error }, { status: 400 });
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
            return NextResponse.json({ message: 'Bad Request', error: 'invalid request data' }, { status: 400 });
          }

          const parsed = validations?.body.safeParse(json);
          if (!parsed.success) {
            return NextResponse.json({ message: 'Bad Request', error: parsed.error }, { status: 400 });
          }

          body = parsed.data;
        }

        return await fn({ session: session, pathParams, queryParams, body });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
      }
    };
  };
}

export default createApiHandler;
