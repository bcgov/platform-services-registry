import _compact from 'lodash-es/compact';
import { Session } from 'next-auth';
import { generateSession } from '@/core/auth-options';
import prisma from '@/core/prisma';
import { processMsUser } from '@/services/msgraph';
import type { AppUserWithRoles } from '@/types/user';
import type { MsUser } from '../../sandbox/types';
import { formatFullName } from './user';

export const msUsers: MsUser[] = require('../../sandbox/mock-users.json');

export const mockUsers = msUsers
  .map((usr) => {
    const appUser = processMsUser(usr);
    if (!appUser) return null;

    const { firstName, lastName, email, ministry, idir, upn, idirGuid } = appUser;
    return {
      firstName,
      lastName,
      idirGuid,
      displayName: formatFullName({ firstName, lastName }),
      email,
      ministry,
      idir,
      upn,
      roles: _compact([usr.jobTitle]),
    } as AppUserWithRoles;
  })
  .filter((v) => v!) as AppUserWithRoles[];

export const mockRoleUsers = mockUsers.filter((usr) => usr.roles.length > 0);
export const mockNoRoleUsers = mockUsers.filter((usr) => usr.roles.length === 0);

export const mockIdirs = mockUsers.map((usr) => usr.idir);
export const mockRoleIdirs = mockRoleUsers.map((usr) => usr.idir);
export const mockNoRoleIdirs = mockNoRoleUsers.map((usr) => usr.idir);

export function findMockUserByIdr(useridir: string) {
  return mockUsers.find(({ idir }) => idir === useridir);
}

export function findMockUserByEmai(_email: string) {
  return mockUsers.find(({ email }) => email === _email);
}

export function findMockUserByIdirGuid(_idirGuid: string) {
  return mockUsers.find(({ idirGuid }) => idirGuid === _idirGuid);
}

export function findMockUserbyRole(role: string) {
  return mockUsers.find(({ roles }) => roles.includes(role));
}

export function findOtherMockUsers(emails: string[]) {
  return mockNoRoleUsers.filter((usr) => !emails.includes(usr.email));
}

export async function upsertMockUser(user: AppUserWithRoles) {
  const data = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    ministry: user.ministry,
    idir: user.idir,
    idirGuid: user.idirGuid,
    upn: user.upn,
    image: '',
  };

  const res = await prisma.user.upsert({
    where: { idirGuid: user.idirGuid },
    update: data,
    create: data,
  });

  return res;
}

export async function generateTestSession(idirGuid: string) {
  const mockUser = findMockUserByIdirGuid(idirGuid);
  if (!mockUser) return null;

  await upsertMockUser(mockUser);

  const session = await generateSession({
    session: {} as Session,
    token: {
      name: mockUser.displayName,
      email: mockUser.email,
    },
    userSession: {
      roles: mockUser.roles,
      idirGuid: mockUser.idirGuid,
      teams: [],
      sub: '',
      accessToken: '',
      refreshToken: '',
      idToken: '',
    },
  });

  return session;
}

export async function mutateMockUsersWithDbUsers() {
  await Promise.all(
    mockUsers.map(async (user) => {
      const dbuser = await upsertMockUser(user);
      user.id = dbuser.id;
      return user;
    }),
  );
}
