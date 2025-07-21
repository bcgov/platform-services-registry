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
  children?: React.ReactNode;
}

function createClientPage<TPathParams extends ZodType<any, any>, TQueryParams extends ZodType<any, any>>({
  roles,
  permissions,
  fallbackUrl = '/',
  validations,
}: HandlerProps<TPathParams, TQueryParams>) {
  const pathParamVal = (validations?.pathParams ?? z.object({})) as TPathParams;
  const queryParamVal = (validations?.queryParams ?? z.object({})) as TQueryParams;

  return function clientPage(Component: React.FC<ComponentProps<TypeOf<TPathParams>, TypeOf<TQueryParams>>>) {
    return function Wrapper({ params, searchParams }: any) {
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
      if (roles?.length && arrayIntersection(roles, _roles).length === 0) {
        handleAccessRedirect();
        return null;
      }

      // Validate user permissions
      if (permissions?.length && !permissions.some((permKey) => _permissions[permKey as keyof typeof _permissions])) {
        handleAccessRedirect();
        return null;
      }

      const getPathParams = async () => {
        // Parse & validate path params
        const parsed = validations?.pathParams?.safeParse(params);
        if (parsed && !parsed.success) {
          router.push(fallbackUrl);
          throw new Error('Invalid path params');
        }
        return parsed?.data ?? pathParamVal.parse({});
      };

      const getQueryParams = async () => {
        // Parse & validate query params
        const rawQuery = parseQueryString(searchParams);
        const parsed = validations?.queryParams?.safeParse(rawQuery);
        if (parsed && !parsed.success) {
          router.push(fallbackUrl);
          throw new Error('Invalid query params');
        }
        return parsed?.data ?? queryParamVal.parse({});
      };

      return (
        <Component session={session} getPathParams={getPathParams} getQueryParams={getQueryParams} router={router} />
      );
    };
  };
}

export default createClientPage;
