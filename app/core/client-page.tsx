'use client';

import _isUndefined from 'lodash-es/isUndefined';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { usePathname, useRouter } from 'next/navigation';
import { Session, PermissionsKey } from 'next-auth';
import { useSession, signOut as appSignOut } from 'next-auth/react';
import React, { useEffect } from 'react';
import { z, TypeOf, ZodType } from 'zod';
import { arrayIntersection, parseQueryString } from '@/utils/js';

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
  getPathParams: () => Promise<TPathParams>;
  getQueryParams: () => Promise<TQueryParams>;
  router: AppRouterInstance;
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
  const pathParams: TypeOf<typeof pathParamVal> | null = null;
  const queryParams: TypeOf<typeof queryParamVal> | null = null;

  return function clientPage(Component: React.FC<ComponentProps<TypeOf<TPathParams>, TypeOf<TQueryParams>>>) {
    return function Wrapper({ params: paramsProm, searchParams: searchParamsProm, children }: any) {
      const router = useRouter();
      const pathname = usePathname();
      const { data: session, update: updateSession, status } = useSession();

      useEffect(() => {
        updateSession();
        if (status === 'authenticated' && localStorage.getItem('postLoginRedirect')) {
          localStorage.removeItem('postLoginRedirect');
        }
      }, []);

      function handleAccessRedirect() {
        if (status === 'unauthenticated' && !['/home', '/', '/login'].includes(pathname)) {
          localStorage.setItem('postLoginRedirect', pathname);
        }
        router.push(fallbackUrl);
      }

      if (session?.requiresRelogin) appSignOut();

      // Wait until the session is fetched by the backend
      if (_isUndefined(session)) return null;

      const _roles = session?.roles ?? [];
      const _permissions = session?.permissions ?? [];

      // Validate user roles
      if (roles && roles.length > 0) {
        const allowed = arrayIntersection(roles, _roles).length > 0;
        if (!allowed) {
          handleAccessRedirect();
          return;
        }
      }

      // Validate user permissions
      if (permissions && permissions.length > 0) {
        const allowed = permissions.some((permKey) => _permissions[permKey as keyof typeof _permissions]);
        if (!allowed) {
          handleAccessRedirect();
          return;
        }
      }

      const getPathParams = async () => {
        // Parse & validate path params
        if (validations?.pathParams) {
          const params = await paramsProm;
          const parsed = validations?.pathParams.safeParse(params);
          if (!parsed.success) {
            handleAccessRedirect();
            return;
          }

          return parsed.data;
        }

        return null;
      };

      const getQueryParams = async () => {
        // Parse & validate query params
        if (validations?.queryParams) {
          const searchParams = await searchParamsProm;
          const query = parseQueryString(searchParams);
          const parsed = validations?.queryParams.safeParse(query);
          if (!parsed.success) {
            handleAccessRedirect();
            return;
          }

          return parsed.data;
        }

        return null;
      };

      return (
        <Component session={session} getPathParams={getPathParams} getQueryParams={getQueryParams} router={router}>
          {children}
        </Component>
      );
    };
  };
}

export default createClientPage;
