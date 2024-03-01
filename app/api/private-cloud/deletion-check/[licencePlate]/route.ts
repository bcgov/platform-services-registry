import { NextResponse } from 'next/server';
import { string, z } from 'zod';
import openshiftDeletionCheck from '@/helpers/openshift';
import { PrivateCloudProject } from '@prisma/client';
import prisma from '@/core/prisma';

import createApiHandler from '@/core/api-handler';

export const fetchCache = 'force-no-store';

const apiHandler = createApiHandler({
  validations: {
    pathParams: z.object({
      licencePlate: string(),
    }),
  },
});

export const GET = apiHandler(async ({ pathParams }) => {
  console.log('GET API ROUTE FOR DELETION CHECK');

  const project: PrivateCloudProject | null = await prisma.privateCloudProject.findUnique({
    where: {
      licencePlate: pathParams.licencePlate,
    },
  });

  if (!project) {
    throw new Error('Product does not exist.');
  }

  const deleteCheckList = await openshiftDeletionCheck(pathParams.licencePlate, project.cluster);

  let result = 'NOT_DELETABLE';

  if (Object.values(deleteCheckList).every((field) => field)) {
    result = 'OK_TO_DELETE';
  }

  return NextResponse.json(result);
});
