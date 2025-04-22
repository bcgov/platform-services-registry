import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { Prisma } from '@/prisma/types';

export default async function listOp({ session }: { session: Session }) {
  const unitPrices = await prisma.privateCloudUnitPrice.findMany({ orderBy: { date: Prisma.SortOrder.asc } });
  return unitPrices;
}
