import { Prisma, User } from '@prisma/client';
import _castArray from 'lodash-es/castArray';
import _compact from 'lodash-es/compact';
import _forEach from 'lodash-es/forEach';
import _uniq from 'lodash-es/uniq';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { proxyUsers } from '@/helpers/mock-users';
import { getUserByEmail, getUserPhoto, processMsUser } from '@/services/msgraph';
import { MsUser, AppUser } from '@/types/user';
import { arrayBufferToBase64 } from '@/utils/base64-arraybuffer';

export async function prepareUserData(user: AppUser, extra = {}) {
  const email = user.email.toLowerCase();

  const image = await getUserPhoto(email);
  const data = {
    email,
    providerUserId: user.providerUserId,
    firstName: user.firstName,
    lastName: user.lastName,
    ministry: user.ministry,
    idir: user.idir,
    idirGuid: user.idirGuid,
    officeLocation: user.officeLocation,
    jobTitle: user.jobTitle,
    upn: user.upn,
    image: image ? arrayBufferToBase64(image) : '',
    ...extra,
  };

  return data;
}

export async function upsertUser(email: string, extra = {}) {
  if (!email) return null;

  try {
    email = email.toLowerCase();

    const adUser = await getUserByEmail(email);
    if (!adUser) return null;

    const data = await prepareUserData(adUser, extra);

    return await prisma.user.upsert({
      where: { email },
      update: data,
      create: data,
    });
  } catch (error) {
    logger.error('upsertUser:', error);
    return null;
  }
}

export async function upsertUsers(email: string | undefined | (string | undefined)[]) {
  const emails = _uniq(_compact(_castArray(email)));
  const result = await Promise.all(emails.map(upsertUser));
  return result;
}

export async function getMatchingUserIds(search: string) {
  if (search === '*') return [];

  const userSearchcreteria: Prisma.StringFilter<'User'> = { contains: search, mode: 'insensitive' };
  const matchingUsers = await prisma.user.findMany({
    where: {
      OR: [{ email: userSearchcreteria }, { firstName: userSearchcreteria }, { lastName: userSearchcreteria }],
    },
    select: { id: true },
  });

  const matchingUserIds = matchingUsers.map((user) => user.id);
  return matchingUserIds;
}

export async function createProxyUsers() {
  const dbUsers = await Promise.all(
    proxyUsers
      .map((puser: MsUser) => {
        const appUser = processMsUser(puser);
        if (!appUser) return null;

        const { displayName, ...clearnUserData } = appUser;

        clearnUserData.email = clearnUserData.email.toLowerCase();
        return prisma.user.upsert({
          where: { email: clearnUserData.email },
          update: clearnUserData,
          create: clearnUserData,
        });
      })
      .filter((v) => v!),
  );

  return dbUsers;
}
