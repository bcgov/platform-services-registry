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
export const proxyNoRoleUsers = proxyUsers.filter((usr) => !usr.jobTitle);
export const proxyNoRoleIDIRs = proxyNoRoleUsers.map((usr) => usr.onPremisesSamAccountName);

export const mockNoRoleUsers = proxyNoRoleUsers.map((usr) => {
  const { firstName, lastName, email, ministry, idir, upn } = processMsUser(usr);
  return { firstName, lastName, email, ministry, idir, upn };
});

export function findMockUserByIDIR(useridir: string) {
  let user = proxyUsers.find(({ onPremisesSamAccountName }) => onPremisesSamAccountName === useridir);
  if (!user) user = proxyUsers[0];

  const { firstName, lastName, email, ministry, idir, upn } = processMsUser(user);
  return { firstName, lastName, email, ministry, idir, upn };
}

export function findMockUserbyRole(role: string) {
  const user = proxyUsers.find(({ jobTitle }) => jobTitle === role);
  if (!user) return null;

  const { firstName, lastName, email, ministry, idir, upn } = processMsUser(user);
  return { firstName, lastName, email, ministry, idir, upn };
}

export function findOhterMockUsers(emails: string[]) {
  return proxyNoRoleUsers
    .filter((usr) => !emails.includes(usr.mail))
    .map((usr) => {
      const { firstName, lastName, email, ministry, idir, upn } = processMsUser(usr);
      return { firstName, lastName, email, ministry, idir, upn };
    });
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
