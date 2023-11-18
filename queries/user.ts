import { User } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';

export async function userInfo(): Promise<{
  // ministryRoleReadOnlyAdmin: string[] | null,
  ministryRole: string[] | null;
  userEmail: string | undefined;
} | null> {
  const session = await getServerSession(authOptions);

  if (session) {
    const { email: authEmail, roles: authRoles }: { email: string; roles: string[] } = session.user;
    const isAdmin = authRoles.includes('admin');
    const ministryRole = authRoles
      .filter((role) => role.startsWith('ministry') && role.indexOf('admin', role.length - 5) !== -1)
      .map((role) => role.split('-')[1].toLocaleUpperCase());

    // In case read only admin role for ministries will be needed
    // const ministryRoleReadOnlyAdmin = authRoles.filter(role => role.startsWith("ministry")
    // && role.indexOf('read-only-admin', role.length - 15) !== -1)
    // .map(role => role.split('-')[1].toLocaleUpperCase());

    const userEmail = isAdmin ? undefined : authEmail;
    return {
      // ministryRoleReadOnlyAdmin,
      ministryRole,
      userEmail,
    };
  } else return null;
}

export const getUsers = (): Promise<User[]> => prisma.user.findMany();

export const getUserById = (id: string): Promise<User | null> =>
  prisma.user.findUnique({
    where: {
      id: id,
    },
  });

export const getUsersByIds = (ids: string[]): Promise<User[]> =>
  prisma.user.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

export const getUserByEmail = (email: string): Promise<User | null> =>
  prisma.user.findUnique({
    where: {
      email: email,
    },
  });

export const getMe = (email: string): Promise<User | null> =>
  prisma.user.findUnique({
    where: {
      email,
    },
  });
