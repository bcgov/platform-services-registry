import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { OrganizationBody } from '@/validation-schemas/organization';

export default async function createOp({ session, body }: { session: Session; body: OrganizationBody }) {
  const { code, name } = body;

  const newOrg = await prisma.organization.create({
    data: { code, name },
  });

  await createEvent(EventType.CREATE_ORGANIZATION, session.user.id, { id: newOrg.id, data: { code, name } });
  return OkResponse(newOrg);
}
