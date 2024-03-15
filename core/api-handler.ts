import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/core/auth-options';
import { z } from 'zod';
import { parseQueryString } from '@/utils/query-string';

interface HandlerProps {
  roles?: string[];
  validations?: {
    pathParams?: z.ZodObject<any>;
    queryParams?: z.ZodObject<any>;
    body?: z.ZodObject<any>;
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

function createApiHandler<TPathParams = any, TQueryParams = any, TBody = any>({ roles, validations }: HandlerProps) {
  return function apiHandler(
    fn: (props: RouteProps<TPathParams, TQueryParams, TBody>) => Promise<NextResponse<unknown>>,
  ) {
    return async function (req: NextRequest, { params }: { params: TPathParams } = { params: {} as TPathParams }) {
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

        let pathParams = {} as TPathParams;
        let queryParams = {} as TQueryParams;
        let body = {} as TBody;

        // Parse & validate path params
        if (validations?.pathParams) {
          const parsed = validations?.pathParams.safeParse(params);
          if (!parsed.success) {
            return NextResponse.json({ message: 'Bad Request', error: parsed.error }, { status: 400 });
          }

          pathParams = parsed.data as TPathParams;
        }

        // Parse & validate query params
        if (validations?.queryParams) {
          const query = parseQueryString(req.nextUrl.search);
          const parsed = validations?.queryParams.safeParse(query);
          if (!parsed.success) {
            return NextResponse.json({ message: 'Bad Request', error: parsed.error }, { status: 400 });
          }

          queryParams = parsed.data as TQueryParams;
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

          body = parsed.data as TBody;
        }

        return await fn({ session, pathParams, queryParams, body });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
      }
    };
  };
}

export default createApiHandler;
