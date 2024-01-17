import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { SecurityConfig, $Enums } from '@prisma/client';
import createApiHandler from '@/core/api-handler';

interface PathParam {
  licencePlate: string;
}

interface QueryParam {
  context: $Enums.ProjectContext;
}

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const queryParamSchema = z.object({
  context: z.union([z.literal($Enums.ProjectContext.PRIVATE), z.literal($Enums.ProjectContext.PUBLIC)]),
});

const apiHandler = createApiHandler<PathParam, QueryParam>({
  roles: ['user'],
  validations: { pathParams: pathParamSchema, queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const result = await prisma.securityConfig.findUnique({
    where: {
      licencePlate: pathParams.licencePlate,
      context: queryParams.context,
    },
    session: session as never,
  });

  return NextResponse.json(result);
});
