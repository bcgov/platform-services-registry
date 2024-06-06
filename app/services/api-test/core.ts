import { NextRequest } from 'next/server';
import { BASE_URL } from '@/config';

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
  const _url = template(url, pathParams);

  return {
    url: `${BASE_URL}/api/${_url}`,
    queryParams,
  };
}

export function createRoute(url: string) {
  return {
    get: async function (handler: Handler, paramData?: ParamData) {
      const { url: _url, queryParams } = populatePathParams(url, paramData);
      const req = new NextRequest(_url, { method: 'GET' });
      const res = await handler(req, { params: queryParams });

      return res;
    },
    post: async function (handler: Handler, data: any, paramData?: ParamData) {
      const { url: _url, queryParams } = populatePathParams(url, paramData);
      const req = new NextRequest(_url, { method: 'POST', body: JSON.stringify(data) });
      const res = await handler(req, { params: queryParams });

      return res;
    },
    put: async function (handler: Handler, data: any, paramData?: ParamData) {
      const { url: _url, queryParams } = populatePathParams(url, paramData);
      const req = new NextRequest(_url, { method: 'PUT', body: JSON.stringify(data) });
      const res = await handler(req, { params: queryParams });

      return res;
    },
    patch: async function (handler: Handler, data: any, paramData?: ParamData) {
      const { url: _url, queryParams } = populatePathParams(url, paramData);
      const req = new NextRequest(_url, { method: 'PATCH', body: JSON.stringify(data) });
      const res = await handler(req, { params: queryParams });

      return res;
    },
    delete: async function (handler: Handler, paramData?: ParamData) {
      const { url: _url, queryParams } = populatePathParams(url, paramData);
      const req = new NextRequest(_url, { method: 'PATCH' });
      const res = await handler(req, { params: queryParams });

      return res;
    },
  };
}
