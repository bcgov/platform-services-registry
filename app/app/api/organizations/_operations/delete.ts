import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { ObjectId } from '@/validation-schemas';

export default async function deleteOp({ session, id }: { session: Session; id: ObjectId }) {
  const org = await prisma.organization.delete({ where: { id } });
  return OkResponse(org);
}
