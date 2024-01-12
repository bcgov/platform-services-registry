import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { SecurityConfig, $Enums } from '@prisma/client';
import createApiHandler from '@/core/apiHandler';

const bodySchema = z.object({
  licencePlate: z.string(),
  repositories: z.array(z.object({ url: z.string() })).max(10),
  context: z.union([z.literal($Enums.ProjectContext.PRIVATE), z.literal($Enums.ProjectContext.PUBLIC)]),
});

const apiHandler = createApiHandler<null, null, SecurityConfig>({
  roles: ['user'],
  validations: { body: bodySchema },
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
