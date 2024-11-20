import { Session } from 'next-auth';
import { z, TypeOf, ZodType } from 'zod';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';
import { PrivateCloudAdminUpdateBody } from '@/validation-schemas/private-cloud';
import { putPathParamSchema } from '../[licencePlate]/schema';

export default async function updateOp({
  session,
  body,
  pathParams,
}: {
  session: Session;
  body: PrivateCloudAdminUpdateBody;
  pathParams: TypeOf<typeof putPathParamSchema>;
}) {
  const { licencePlate } = pathParams;
  const { isTest } = body;

  await prisma.privateCloudProject.update({
    where: { licencePlate },
    data: { isTest },
  });

  const { data: product } = await models.privateCloudProduct.get({ where: { licencePlate } }, session);
  return OkResponse(product);
}
