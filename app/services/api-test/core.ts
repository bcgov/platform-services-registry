import { MockedFunction } from 'jest-mock';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { BASE_URL } from '@/config';
import { generateTestSession, findMockUserbyRole, findMockUserByEmail, upsertMockUser } from '@/helpers/mock-users';
import { SERVICE_ACCOUNT_DATA } from '@/jest.mock';
import { stringifyQuery } from '@/utils/js';

type Handler<T = any> = (req: NextRequest, Options?: { params: any }) => Promise<TypedResponse<T>>;

export interface TypedResponse<T> extends globalThis.Response {
  json(): Promise<T>;
}

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

async function wrapHanlder<T>(handler: Handler<T>, req: NextRequest, options?: { params: any; data?: any }) {
  const { params, data } = options ?? {};
  const res = await handler(req, { params });

  let resData: any;
  let isJSON = false;

  const contentType = res.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    try {
      resData = await res.json();
      res.json = async () => resData;
      isJSON = true;
    } catch {}
  } else {
    try {
      resData = await res.text();
      res.text = async () => resData;
    } catch {}
  }

  if (res.status < 200 || res.status >= 300) {
    console.log('HTTP Error', {
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: data,
      },
      response: {
        status: res.status,
        headers: res.headers,
        body: isJSON ? JSON.stringify(resData) : resData,
      },
    });
  }

  return res;
}

export function createRoute(baseUrl: string) {
  return {
    get: async function <T>(handler: Handler<T>, url: string, paramData?: ParamData, headers?: any) {
      const { url: _url, pathParams } = populatePathParams(`${baseUrl}${url}`, paramData);
      const req = new NextRequest(_url, { method: 'GET', headers });
      return wrapHanlder(handler, req, { params: pathParams });
    },
    post: async function <T>(handler: Handler<T>, url: string, data: any, paramData?: ParamData, headers?: any) {
      const { url: _url, pathParams } = populatePathParams(`${baseUrl}${url}`, paramData);
      const jsonData = JSON.stringify(data);
      const req = new NextRequest(_url, { method: 'POST', body: jsonData, headers });
      return wrapHanlder(handler, req, { params: pathParams, data: jsonData });
    },
    put: async function <T>(handler: Handler<T>, url: string, data: any, paramData?: ParamData, headers?: any) {
      const { url: _url, pathParams } = populatePathParams(`${baseUrl}${url}`, paramData);
      const jsonData = JSON.stringify(data);
      const req = new NextRequest(_url, { method: 'PUT', body: jsonData, headers });
      return wrapHanlder(handler, req, { params: pathParams, data: jsonData });
    },
    patch: async function <T>(handler: Handler<T>, url: string, data: any, paramData?: ParamData, headers?: any) {
      const { url: _url, pathParams } = populatePathParams(`${baseUrl}${url}`, paramData);
      const jsonData = JSON.stringify(data);
      const req = new NextRequest(_url, { method: 'PATCH', body: jsonData, headers });
      return wrapHanlder(handler, req, { params: pathParams, data: jsonData });
    },
    delete: async function <T>(handler: Handler<T>, url: string, paramData?: ParamData, headers?: any) {
      const { url: _url, pathParams } = populatePathParams(`${baseUrl}${url}`, paramData);
      const req = new NextRequest(_url, { method: 'DELETE', headers });
      return wrapHanlder(handler, req, { params: pathParams });
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

export async function mockUserServiceAccountByEmail(email?: string) {
  mockedGetServerSession.mockResolvedValue(null);

  let mockedValue: { email: string; authRoleNames: string[] } | null = null;
  if (email) {
    const mockUser = findMockUserByEmail(email);
    if (mockUser) {
      mockedValue = { email: mockUser.email, authRoleNames: mockUser.roles.concat() };
      await upsertMockUser(mockUser);
    }
  }

  SERVICE_ACCOUNT_DATA.user = mockedValue;
  SERVICE_ACCOUNT_DATA.team = null;
}

export async function mockUserServiceAccountByRole(role?: string) {
  mockedGetServerSession.mockResolvedValue(null);

  let mockedValue: { email: string; authRoleNames: string[] } | null = null;
  if (role) {
    const mockUser = findMockUserbyRole(role);
    if (mockUser) {
      mockedValue = { email: mockUser.email, authRoleNames: mockUser.roles.concat() };
      await upsertMockUser(mockUser);
    }
  }

  SERVICE_ACCOUNT_DATA.user = mockedValue;
  SERVICE_ACCOUNT_DATA.team = null;
}

export async function mockTeamServiceAccount(roles: string[]) {
  mockedGetServerSession.mockResolvedValue(null);

  SERVICE_ACCOUNT_DATA.user = null;
  SERVICE_ACCOUNT_DATA.team = { roles };
}
