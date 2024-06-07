import { Session } from 'next-auth';
import { generateSession } from '@/core/auth-options';
import prisma from '@/core/prisma';
import { processMsUser } from '@/services/msgraph';
import type { MsUser } from '@/types/user';
const mockFile: MockFile = require('../../localdev/m365proxy/mocks.json');

interface MockResponse {
  request: {
    url: string;
    method?: string;
  };
  response: {
    body?: any;
    statusCode?: string;
  };
}

interface MockFile {
  $schema: string;
  mocks: MockResponse[];
}

export const proxyUsers: MsUser[] = mockFile.mocks.find(
  (mock: MockResponse) => mock.request.url === 'https://graph.microsoft.com/v1.0/users?$filter*',
)?.response.body.value;

export const proxyAllIDIRs = proxyUsers.map((usr) => usr.onPremisesSamAccountName);
export const proxyNoRoleIDIRs = proxyUsers.filter((usr) => !usr.jobTitle).map((usr) => usr.onPremisesSamAccountName);

export function findMockUserByIDIR(useridir: string) {
  let user = proxyUsers.find(({ onPremisesSamAccountName }) => onPremisesSamAccountName === useridir);
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
