'use client';

import { z, TypeOf, ZodType } from 'zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Session, PermissionsKey } from 'next-auth';
import _isUndefined from 'lodash-es/isUndefined';
import { parseQueryString } from '@/utils/query-string';
import { arrayIntersection } from '@/utils/collection';
import React from 'react';

interface HandlerProps<TPathParams, TQueryParams> {
  roles?: string[];
  permissions?: PermissionsKey[];
  fallbackUrl?: string;
  validations?: {
    pathParams?: TPathParams;
    queryParams?: TQueryParams;
  };
}

interface ComponentProps<TPathParams, TQueryParams> {
  session: Session | null;
  pathParams: TPathParams;
  queryParams: TQueryParams;
  children: React.ReactNode;
}

interface PageProp {
  params: Record<string, any>;
  searchParams: URLSearchParams;
  children: React.ReactNode;
}

function createClientPage<TPathParams extends ZodType<any, any>, TQueryParams extends ZodType<any, any>>({
  roles,
  permissions,
  fallbackUrl = '/',
  validations,
}: HandlerProps<TPathParams, TQueryParams>) {
  const { pathParams: pathParamVal = z.object({}), queryParams: queryParamVal = z.object({}) } = validations ?? {};
  let pathParams: TypeOf<typeof pathParamVal> | null = null;
  let queryParams: TypeOf<typeof queryParamVal> | null = null;

  return function clientPage(Component: React.FC<ComponentProps<TypeOf<TPathParams>, TypeOf<TQueryParams>>>) {
    return function wrapper({ params, searchParams, children }: PageProp) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data: session } = useSession();

      // Wait until the session is fetched by the backend
      if (_isUndefined(session)) return null;

      const _roles = session?.roles ?? [];
      const _permissions = session?.permissions ?? [];

      // Validate user roles
      if (roles && roles.length > 0) {
        const allowed = arrayIntersection(roles, _roles).length > 0;
        if (!allowed) {
          return router.push(fallbackUrl);
        }
      }

      // Validate user permissions
      if (permissions && permissions.length > 0) {
        const allowed = permissions.some((permKey) => _permissions[permKey as keyof typeof _permissions]);
        if (!allowed) {
          return router.push(fallbackUrl);
        }
      }

      // Parse & validate path params
      if (validations?.pathParams) {
        const parsed = validations?.pathParams.safeParse(params);
        if (!parsed.success) {
          return router.push(fallbackUrl);
        }

        pathParams = parsed.data;
      }

      // Parse & validate query params
      if (validations?.queryParams) {
        const query = parseQueryString(searchParams);
        const parsed = validations?.queryParams.safeParse(query);
        if (!parsed.success) {
          return router.push(fallbackUrl);
        }

        queryParams = parsed.data;
      }

      return (
        <Component session={session} pathParams={pathParams} queryParams={queryParams}>
          {children}
        </Component>
      );
    };
  };
}

export default createClientPage;
