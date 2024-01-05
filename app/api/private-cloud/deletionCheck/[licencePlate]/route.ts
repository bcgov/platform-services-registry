import { NextResponse } from 'next/server';
import { string, z } from 'zod';
import openshiftDeletionCheck from '@/scripts/deletioncheck';
import { PrivateCloudProject } from '@prisma/client';
import prisma from '@/lib/prisma';

import createApiHandler from '@/core/apiHandler';

const apiHandler = createApiHandler({
  validations: {
    pathParams: z.object({
      licencePlate: string(),
    }),
  },
});

export const GET = apiHandler(async ({ pathParams }) => {
  const project: PrivateCloudProject | null = await prisma.privateCloudProject.findUnique({
    where: {
      licencePlate: pathParams.licencePlate,
    },
  });

  if (!project) {
    throw new Error('Product does not exist.');
  }

  const deleteCheckList = await openshiftDeletionCheck(pathParams.licencePlate, project.cluster);

  // let result = 'NOT_DELETABLE';

  // if (Object.values(deleteCheckList).every((field) => field)) {
  //   result = 'OK_TO_DELETE';
  // }

  const result = 'OK_TO_DELETE';

  return NextResponse.json(result);
});
