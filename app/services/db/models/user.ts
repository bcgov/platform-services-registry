import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { Prisma, User } from '@/prisma/client';
import { UserDecorate } from '@/types/doc-decorate';
import { createSessionModel } from './core';

async function baseFilter(session: Session) {
  let filter!: Prisma.UserWhereInput;
  if (!session.isAdmin) {
    filter = {
      OR: [
        { email: session.user.email as string },
        { ministry: { in: session.ministries.editor } },
        { ministry: { in: session.ministries.reader } },
      ],
    };
  }

  return filter;
}

type UserDecorated = User & UserDecorate;

async function decorate(doc: User, session: Session) {
  const decoratedDoc = doc as UserDecorated;
  decoratedDoc._permissions = {
    view: true,
    edit: false,
    delete: false,
  };

  return decoratedDoc;
}

export const userModel = createSessionModel<
  User,
  User,
  UserDecorated,
  UserDecorated,
  NonNullable<Parameters<typeof prisma.user.create>[0]>,
  NonNullable<Parameters<typeof prisma.user.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.user.update>[0]>,
  NonNullable<Parameters<typeof prisma.user.upsert>[0]>
>({
  model: prisma.user,
  baseFilter,
  decorate,
});
