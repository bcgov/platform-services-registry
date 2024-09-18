import { $Enums, Prisma } from '@prisma/client';
import prisma from '@/core/prisma';
import { proxyUsers } from '@/helpers/mock-users';
import { processMsUser } from '@/services/msgraph';
import { MsUser, AppUser } from '@/types/user';

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
    proxyUsers.map((puser: MsUser) => {
      const { displayName, ...clearnUserData } = processMsUser(puser);

      clearnUserData.email = clearnUserData.email.toLowerCase();
      return prisma.user.upsert({
        where: { email: clearnUserData.email },
        update: clearnUserData,
        create: clearnUserData,
      });
    }),
  );

  return dbUsers;
}
