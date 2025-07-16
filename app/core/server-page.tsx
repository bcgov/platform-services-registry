import _isUndefined from 'lodash-es/isUndefined';
import { redirect } from 'next/navigation';
import { Session, PermissionsKey } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { z, TypeOf, ZodType } from 'zod';
import { authOptions } from '@/core/auth-options';
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
  pathParams: TPathParams;
  queryParams: TQueryParams;
  children?: React.ReactNode;
}

type Awaitable<T> = T | Promise<T>;

function createServerPage<TPathParams extends ZodType<any, any>, TQueryParams extends ZodType<any, any>>({
  roles,
  permissions,
  fallbackUrl = '/',
  validations,
}: HandlerProps<TPathParams, TQueryParams>) {
  const pathParamVal = (validations?.pathParams ?? z.object({})) as TPathParams;
  const queryParamVal = (validations?.queryParams ?? z.object({})) as TQueryParams;

  return function serverPage(Component: React.FC<ComponentProps<TypeOf<TPathParams>, TypeOf<TQueryParams>>>) {
    return async function Wrapper({ params, searchParams, children }: any) {
      const rawParams = await (params as Awaitable<{ [key: string]: string }>);
      const rawSearchParams = await (searchParams as Awaitable<{ [key: string]: string | string[] | undefined }>);
      const session = await getServerSession(authOptions);

      // Wait until the session is fetched by the backend
      if (_isUndefined(session)) return null;

      const _roles = session?.roles ?? [];
      const _permissions = session?.permissions ?? [];

      // Validate user roles
      if (roles?.length && arrayIntersection(roles, _roles).length === 0) {
        return redirect(fallbackUrl);
      }

      // Validate user permissions
      if (permissions?.length && !permissions.some((permKey) => _permissions[permKey as keyof typeof _permissions])) {
        return redirect(fallbackUrl);
      }

      // Parse & validate path params
      let pathParams: TypeOf<TPathParams>;
      if (validations?.pathParams) {
        const parsed = validations.pathParams.safeParse(rawParams);
        if (!parsed.success) return redirect(fallbackUrl);
        pathParams = parsed.data;
      } else {
        pathParams = pathParamVal.parse({});
      }

      // Parse & validate query params
      let queryParams: TypeOf<TQueryParams>;
      if (validations?.queryParams) {
        const query = parseQueryString(new URLSearchParams(rawSearchParams as Record<string, string>));
        const parsed = validations.queryParams.safeParse(query);
        if (!parsed.success) return redirect(fallbackUrl);
        queryParams = parsed.data;
      } else {
        queryParams = queryParamVal.parse({});
      }

      return <Component session={session} pathParams={pathParams} queryParams={queryParams} />;
    };
  };
}

export default createServerPage;
