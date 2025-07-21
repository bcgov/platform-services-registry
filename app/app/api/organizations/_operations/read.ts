import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { ObjectId } from '@/validation-schemas';

export default async function readOp({ session, id }: { session: Session; id: ObjectId }) {
  const org = await prisma.organization.findUnique({ where: { id } });
  return OkResponse(org);
}
