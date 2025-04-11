import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { PrivateCloudUnitPriceBody } from '@/validation-schemas/private-cloud';
import { putPathParamSchema } from '../[date]/schema';

export default async function updateOp({
  session,
  body,
  pathParams,
}: {
  session: Session;
  body: PrivateCloudUnitPriceBody;
  pathParams: TypeOf<typeof putPathParamSchema>;
}) {
  const { date } = pathParams;

  const unitPrice = await prisma.privateCloudUnitPrice.upsert({
    where: { date },
    update: body,
    create: { ...body, date },
  });

  return OkResponse(unitPrice);
}
