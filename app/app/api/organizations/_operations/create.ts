import { Session } from 'next-auth';
import { AUTH_RESOURCE } from '@/config';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { ensureClientRole } from '@/services/keycloak/app-realm';
import { OrganizationBody } from '@/validation-schemas/organization';

export default async function createOp({ session, body }: { session: Session; body: OrganizationBody }) {
  const { code, name } = body;

  const newOrg = await prisma.organization.create({
    data: { code, name },
  });

  await Promise.all([
    ensureClientRole(AUTH_RESOURCE, `ministry-${code.toLocaleLowerCase()}-reader`, {
      description: `Ministry ${code} Reader - ${name}`,
    }),
    ensureClientRole(AUTH_RESOURCE, `ministry-${code.toLocaleLowerCase()}-editor`, {
      description: `Ministry ${code} Editor - ${name}`,
    }),
  ]);

  await createEvent(EventType.CREATE_ORGANIZATION, session.user.id, { id: newOrg.id, data: newOrg });
  return OkResponse(newOrg);
}
