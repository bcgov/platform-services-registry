import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { ObjectId } from '@/validation-schemas';
import { OrganizationBody } from '@/validation-schemas/organization';

export default async function updateOp({
  session,
  id,
  body,
}: {
  session: Session;
  id: ObjectId;
  body: OrganizationBody;
}) {
  const org = await prisma.organization.update({ where: { id }, data: body });

  await createEvent(EventType.CREATE_ORGANIZATION, session.user.id, {
    id: org.id,
    data: { code: org.code, name: org.name },
  });

  return OkResponse(org);
}
