import prisma from '@/core/prisma';
import { Session } from 'next-auth';

export default async function listOp({ session }: { session: Session | null }) {
  const products = await prisma.privateCloudProject.findMany({
    where: {},
    skip: 0,
    take: 2,
    session: session as never,
  });
  return products;
}
