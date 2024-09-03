import _castArray from 'lodash-es/castArray';
import _compact from 'lodash-es/compact';
import _forEach from 'lodash-es/forEach';
import _uniq from 'lodash-es/uniq';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { getUserByEmail, getUserPhoto } from '@/services/msgraph';
import { arrayBufferToBase64 } from '@/utils/base64-arraybuffer';

export async function upsertUser(email: string, extra = {}) {
  if (!email) return null;

  try {
    email = email.toLowerCase();

    const adUser = await getUserByEmail(email);
    if (!adUser) return null;

    const adUserPhoto = await getUserPhoto(email);
    const data = {
      email,
      providerUserId: adUser.providerUserId,
      firstName: adUser.firstName,
      lastName: adUser.lastName,
      ministry: adUser.ministry,
      idir: adUser.idir,
      upn: adUser.upn,
      image: adUserPhoto ? arrayBufferToBase64(adUserPhoto) : '',
      ...extra,
    };

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
