import { Prisma, Ministry, User } from '@prisma/client';
import _castArray from 'lodash-es/castArray';
import _compact from 'lodash-es/compact';
import _forEach from 'lodash-es/forEach';
import _uniq from 'lodash-es/uniq';
import { Session } from 'next-auth';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { getUserByEmail, getUserPhoto } from '@/services/msgraph';
import { UserDecorate } from '@/types/doc-decorate';
import { arrayBufferToBase64 } from '@/utils/base64-arraybuffer';
import { createSessionModel } from './core';

async function readFilter(session: Session) {
  let baseFilter!: Prisma.UserWhereInput;
  if (!session.isAdmin) {
    baseFilter = {
      OR: [
        { email: session.user.email as string },
        { ministry: { in: session.ministries.editor as Ministry[] } },
        { ministry: { in: session.ministries.reader as Ministry[] } },
      ],
    };
  }

  return baseFilter;
}

async function writeFilter(session: Session) {
  return false;
}

type UserDecorated = User & UserDecorate;

async function decorate(doc: User, session: Session) {
  const decoratedDoc = doc as UserDecorated;
  decoratedDoc._permissions = {
    view: true,
  };

  return decoratedDoc;
}

export const userModel = createSessionModel<
  User,
  UserDecorated,
  User,
  UserDecorated,
  NonNullable<Parameters<typeof prisma.user.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.user.upsert>[0]>
>({
  model: prisma.user,
  readFilter,
  decorate,
});

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
      idirGuid: adUser.idirGuid,
      officeLocation: adUser.officeLocation,
      jobTitle: adUser.jobTitle,
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
