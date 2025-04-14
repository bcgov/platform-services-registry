import { Prisma } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';

export default async function listOp({ session }: { session: Session }) {
  const unitPrices = await prisma.privateCloudUnitPrice.findMany({ orderBy: { date: Prisma.SortOrder.asc } });
  return unitPrices;
}
