import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { ObjectId } from '@/validation-schemas';

export default async function deleteOp({ session, id, to }: { session: Session; id: ObjectId; to: ObjectId }) {
  await Promise.all([
    prisma.privateCloudProduct.updateMany({ where: { organizationId: id }, data: { organizationId: to } }),
    prisma.privateCloudRequestData.updateMany({ where: { organizationId: id }, data: { organizationId: to } }),
    prisma.publicCloudProduct.updateMany({ where: { organizationId: id }, data: { organizationId: to } }),
    prisma.publicCloudRequestData.updateMany({ where: { organizationId: id }, data: { organizationId: to } }),
  ]);

  const org = await prisma.organization.delete({ where: { id } });

  await createEvent(EventType.DELETE_ORGANIZATION, session.user.id, {
    id: org.id,
    to,
    data: { code: org.code, name: org.name, isAgMinistry: org.isAgMinistry },
  });

  return OkResponse(org);
}
