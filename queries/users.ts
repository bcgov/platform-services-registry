import { $Enums, Prisma } from '@prisma/client';
import prisma from '@/core/prisma';
import { MsUser, AppUser } from '@/types/user';
import { processMsUser } from '@/services/msgraph';
const m365ProxyResponse = require('../localdev/m365proxy/responses.json');
const proxyUsers = m365ProxyResponse.responses.find(
  (res: { url: string }) => res.url === 'https://graph.microsoft.com/v1.0/users?$filter*',
).responseBody.value;

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
      const { id, displayName, ...clearnUserData } = processMsUser(puser);
      return prisma.user.upsert({
        where: { email: clearnUserData.email },
        update: clearnUserData,
        create: clearnUserData,
      });
    }),
  );

  return dbUsers;
}
