import prisma from '@/core/prisma';
import _compact from 'lodash-es/compact';
import _castArray from 'lodash-es/castArray';
import _forEach from 'lodash-es/forEach';
import { getUser } from '@/services/msgraph';

export async function upsertUser(email: string) {
  const adUser = await getUser(email);
  if (!adUser) return null;

  const data = {
    email: adUser.email,
    firstName: adUser.firstName,
    lastName: adUser.lastName,
    ministry: adUser.ministry,
    idir: adUser.idir,
    upn: adUser.upn,
  };

  return prisma.user.upsert({
    where: { email },
    update: data,
    create: data,
  });
}

export async function upsertUsers(email: string | undefined | (string | undefined)[]) {
  const emails = _compact(_castArray(email));
  const result = await Promise.all(emails.map(upsertUser));
  return result;
}
