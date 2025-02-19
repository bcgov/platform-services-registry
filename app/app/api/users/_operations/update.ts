import _isUndefined from 'lodash-es/isUndefined';
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
  const { roles, onboardingDate } = body;

  const user = await prisma.user.findUnique({ where: { id }, select: { email: true } });
  if (!user) {
    return BadRequestResponse('user not found');
  }

  let updatedRoles: (string | undefined)[] = [];
  if (roles && session.permissions.editUserRoles) {
    updatedRoles = (await updateUserRoles(user.email, roles))?.roles ?? [];
  }

  let updatedOnboardingDate: Date | null = null;
  if (!_isUndefined(onboardingDate) && session.permissions.editUserOnboardingDate) {
    const updatedUser = await prisma.user.update({ where: { id }, data: { onboardingDate } });
    updatedOnboardingDate = updatedUser.onboardingDate;
  }

  return OkResponse({ roles: updatedRoles, onboardingDate: updatedOnboardingDate });
}
