import { Session } from 'next-auth';
import prisma from '@/core/prisma';

export default async function listOp({ session }: { session: Session | null }) {
  const products = await prisma.publicCloudProject.findMany({
    where: {},
    skip: 0,
    take: 2,
    session: session as never,
  });
  return products;
}
