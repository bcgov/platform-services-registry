import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { OrganizationBody } from '@/validation-schemas/organization';

export default async function createOp({ session, body }: { session: Session; body: OrganizationBody }) {
  const { code, name } = body;

  const newOrg = await prisma.organization.create({
    data: { code, name },
  });

  return OkResponse(newOrg);
}
