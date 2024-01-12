import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SecurityConfig, $Enums } from '@prisma/client';
import createApiHandler from '@/core/apiHandler';
import { SecurityConfigRequestBodySchema } from '@/schema';

const apiHandler = createApiHandler<null, null, SecurityConfig>({
  roles: ['user'],
  validations: { body: SecurityConfigRequestBodySchema },
});
export const PUT = apiHandler(async ({ body, session }) => {
  const exists =
    body.context === $Enums.ProjectContext.PRIVATE
      ? await prisma.privateCloudProject.count()
      : await prisma.publicCloudProject.count();

  if (exists === 0) {
    throw Error('invalid project');
  }

  const result = await prisma.securityConfig.upsert({
    where: {
      licencePlate: body.licencePlate,
      context: body.context,
    },
    update: body,
    create: body,
  });

  return NextResponse.json(result);
});
