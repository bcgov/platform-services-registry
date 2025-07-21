import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
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
  return OkResponse(org);
}
