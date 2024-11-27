import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse } from '@/core/responses';
import { updateUserRoles } from '@/services/keycloak/app-realm';
import { UserUpdateBody } from '@/validation-schemas';
import { putPathParamSchema } from '../[id]/schema';

export default async function updateOp({
  session,
  body,
  pathParams,
}: {
  session: Session;
  body: UserUpdateBody;
  pathParams: TypeOf<typeof putPathParamSchema>;
}) {
  const { id } = pathParams;
  const { roles } = body;

  const user = await prisma.user.findUnique({ where: { id }, select: { email: true } });
  if (!user) {
    return BadRequestResponse('user not found');
  }

  const result = await updateUserRoles(user.email, roles);

  return OkResponse(result);
}
