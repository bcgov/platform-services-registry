import { Session } from 'next-auth';
import { AUTH_RESOURCE } from '@/config';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { ensureClientRole, reassignUsersToRole, removeClientRole } from '@/services/keycloak/app-realm';
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
  const existing = await prisma.organization.findUnique({ where: { id } });
  if (!existing) {
    return BadRequestResponse('Organization not found');
  }

  const org = await prisma.organization.update({ where: { id }, data: body });
  const oldCode = existing.code.toLocaleLowerCase();
  const newCode = org.code.toLocaleLowerCase();

  if (oldCode !== newCode) {
    // Ensure roles are created for the new(updated) organization code
    await Promise.all([
      ensureClientRole(AUTH_RESOURCE, `ministry-${newCode}-reader`, {
        description: `Ministry ${body.code} Reader - ${body.name}`,
      }),
      ensureClientRole(AUTH_RESOURCE, `ministry-${newCode}-editor`, {
        description: `Ministry ${body.code} Editor - ${body.name}`,
      }),
    ]);

    // Reassign users from old roles to new roles
    await Promise.all([
      reassignUsersToRole(AUTH_RESOURCE, `ministry-${oldCode}-reader`, `ministry-${newCode}-reader`),
      reassignUsersToRole(AUTH_RESOURCE, `ministry-${oldCode}-editor`, `ministry-${newCode}-editor`),
    ]);

    // Remove old roles
    await Promise.all([
      removeClientRole(AUTH_RESOURCE, `ministry-${oldCode}-reader`),
      removeClientRole(AUTH_RESOURCE, `ministry-${oldCode}-editor`),
    ]);
  }

  await createEvent(EventType.CREATE_ORGANIZATION, session.user.id, {
    id: org.id,
    data: org,
  });

  return OkResponse(org);
}
