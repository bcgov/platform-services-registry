import { Session } from 'next-auth';
import { AUTH_RESOURCE } from '@/config';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { removeClientRole } from '@/services/keycloak/app-realm';
import { ObjectId } from '@/validation-schemas';

export default async function deleteOp({ session, id, to }: { session: Session; id: ObjectId; to: ObjectId }) {
  // Update related entities to point to the new organization
  await Promise.all([
    prisma.privateCloudProduct.updateMany({ where: { organizationId: id }, data: { organizationId: to } }),
    prisma.privateCloudRequestData.updateMany({ where: { organizationId: id }, data: { organizationId: to } }),
    prisma.publicCloudProduct.updateMany({ where: { organizationId: id }, data: { organizationId: to } }),
    prisma.publicCloudRequestData.updateMany({ where: { organizationId: id }, data: { organizationId: to } }),
  ]);

  const org = await prisma.organization.delete({ where: { id } });
  const oldCode = org.code.toLocaleLowerCase();
  await Promise.all([
    removeClientRole(AUTH_RESOURCE, `ministry-${oldCode}-reader`),
    removeClientRole(AUTH_RESOURCE, `ministry-${oldCode}-editor`),
  ]);

  await createEvent(EventType.DELETE_ORGANIZATION, session.user.id, {
    id: org.id,
    to,
    data: org,
  });

  return OkResponse(org);
}
