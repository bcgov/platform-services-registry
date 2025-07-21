import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { ObjectId } from '@/validation-schemas';

export default async function deleteOp({ session, id }: { session: Session; id: ObjectId }) {
  const org = await prisma.organization.delete({ where: { id } });

  await createEvent(EventType.DELETE_ORGANIZATION, session.user.id, {
    id: org.id,
    data: { code: org.code, name: org.name },
  });

  return OkResponse(org);
}
