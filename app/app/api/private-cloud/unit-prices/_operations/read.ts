import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { getPathParamSchema } from '../[date]/schema';

export default async function readOp({
  session,
  pathParams,
}: {
  session: Session;
  pathParams: TypeOf<typeof getPathParamSchema>;
}) {
  const { date } = pathParams;

  const unitPrice = await prisma.privateCloudUnitPrice.findUnique({ where: { date } });
  return OkResponse(unitPrice);
}
