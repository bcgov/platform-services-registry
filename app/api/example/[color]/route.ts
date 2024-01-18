import { NextResponse } from 'next/server';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';

interface PathParam {
  color: string;
}

interface QueryParam {
  city: string;
  animals: string[];
}

interface Body {
  name: string;
  age: number;
}

const pathParamSchema = z.object({
  color: z.string(),
});

const queryParamSchema = z.object({
  city: z.string(),
  animals: z.array(z.string()),
});

const bodySchema = z.object({
  name: z.string(),
  age: z.number(),
});

const apiHandler = createApiHandler<PathParam, QueryParam, Body>({
  roles: ['admin'],
  validations: { pathParams: pathParamSchema, queryParams: queryParamSchema, body: bodySchema },
});
export const POST = apiHandler(async ({ pathParams, queryParams, body, session }) => {
  return NextResponse.json({ pathParams, queryParams, body });
});
