import { MockedFunction } from 'jest-mock';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { BASE_URL } from '@/config';
import { generateTestSession, findMockUserbyRole } from '@/helpers/mock-users';
import { stringifyQuery } from '@/utils/query-string';

type Handler = (req: NextRequest, { params }?: { params: any }) => Promise<Response>;

interface Params {
  [key: string]: any;
}

export interface ParamData {
  pathParams?: Params;
  queryParams?: Params;
}

function template(templateString: string, data: Params) {
  return templateString.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

function populatePathParams(url: string, paramData?: ParamData) {
  const { pathParams = {}, queryParams } = paramData ?? {};

  let searchString = '';
  if (queryParams) {
    searchString = '?' + stringifyQuery(queryParams);
  }

  const _url = template(url, pathParams);

  return {
    url: `${BASE_URL}/api${_url}${searchString}`,
    pathParams,
  };
}

export function createRoute(baseUrl: string) {
  return {
    get: async function (handler: Handler, url: string, paramData?: ParamData) {
      const { url: _url, pathParams } = populatePathParams(`${baseUrl}${url}`, paramData);
      const req = new NextRequest(_url, { method: 'GET' });
      const res = await handler(req, { params: pathParams });

      return res;
    },
    post: async function (handler: Handler, url: string, data: any, paramData?: ParamData) {
      const { url: _url, pathParams } = populatePathParams(`${baseUrl}${url}`, paramData);
      const req = new NextRequest(_url, { method: 'POST', body: JSON.stringify(data) });
      const res = await handler(req, { params: pathParams });

      return res;
    },
    put: async function (handler: Handler, url: string, data: any, paramData?: ParamData) {
      const { url: _url, pathParams } = populatePathParams(`${baseUrl}${url}`, paramData);
      const req = new NextRequest(_url, { method: 'PUT', body: JSON.stringify(data) });
      const res = await handler(req, { params: pathParams });

      return res;
    },
    patch: async function (handler: Handler, url: string, data: any, paramData?: ParamData) {
      const { url: _url, pathParams } = populatePathParams(`${baseUrl}${url}`, paramData);
      const req = new NextRequest(_url, { method: 'PATCH', body: JSON.stringify(data) });
      const res = await handler(req, { params: pathParams });

      return res;
    },
    delete: async function (handler: Handler, url: string, paramData?: ParamData) {
      const { url: _url, pathParams } = populatePathParams(`${baseUrl}${url}`, paramData);
      const req = new NextRequest(_url, { method: 'DELETE' });
      const res = await handler(req, { params: pathParams });

      return res;
    },
  };
}

export const mockedGetServerSession = getServerSession as unknown as MockedFunction<typeof getServerSession>;

export async function mockSessionByEmail(email?: string) {
  if (!email) {
    mockedGetServerSession.mockResolvedValue(null);
  } else {
    const mockSession = await generateTestSession(email);
    mockedGetServerSession.mockResolvedValue(mockSession);
  }
}

export async function mockSessionByRole(role?: string) {
  if (!role) {
    mockedGetServerSession.mockResolvedValue(null);
  } else {
    const user = findMockUserbyRole(role);
    if (!user) mockedGetServerSession.mockResolvedValue(null);
    else {
      const mockSession = await generateTestSession(user.email);
      mockedGetServerSession.mockResolvedValue(mockSession);
    }
  }
}
