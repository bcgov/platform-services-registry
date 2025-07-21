import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';

export default async function listOp({ session }: { session: Session }) {
  const orgs = await prisma.organization.findMany({});
  return OkResponse(orgs);
}
