import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { deletePathParamSchema } from '../[date]/schema';

export default async function deleteOp({
  session,
  pathParams,
}: {
  session: Session;
  pathParams: TypeOf<typeof deletePathParamSchema>;
}) {
  const { date } = pathParams;

  const unitPrice = await prisma.privateCloudUnitPrice.delete({
    where: { date },
  });

  return OkResponse(unitPrice);
}
