import prisma from '@/core/prisma';
import { processMsUser } from '@/services/msgraph';
import { MsUser, AppUser } from '@/types/user';
import { generateSession } from '@/core/auth-options';
import { Session } from 'next-auth';
const m365ProxyResponse = require('../localdev/m365proxy/responses.json');
const proxyUsers = m365ProxyResponse.responses.find(
  (res: { url: string }) => res.url === 'https://graph.microsoft.com/v1.0/users?$filter*',
).responseBody.value;

export function findMockUserByIDIR(useridir: string) {
  let user = proxyUsers.find(
    ({ onPremisesSamAccountName }: { onPremisesSamAccountName: string }) => onPremisesSamAccountName === useridir,
  );
  if (!user) user = proxyUsers[0];

  const { firstName, lastName, email, ministry, idir, upn } = processMsUser(user);
  return { firstName, lastName, email, ministry, idir, upn };
}

export async function generateTestSession(testEmail: string) {
  const proxyUser = proxyUsers.find(({ mail }: { mail: string }) => mail === testEmail) as MsUser;
  const user = processMsUser(proxyUser);

  const data = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    ministry: user.ministry,
    idir: user.idir,
    upn: user.upn,
    image: '',
  };

  await prisma.user.upsert({
    where: { email: user.email },
    update: data,
    create: data,
  });

  const session = await generateSession({
    session: {} as Session,
    token: { roles: [proxyUser.jobTitle], name: proxyUser.displayName, email: proxyUser.mail },
  });

  return session;
}
