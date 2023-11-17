import { User } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import checkUserMinistryRole from '@/components/utils/checkUserMinistryRole';

export async function userInfo() {
  try {
    const session = await getServerSession(authOptions);
    const { email: authEmail, roles: authRoles } = session?.user;
    const isAdmin = authRoles.includes('admin');
    const ministryRole = checkUserMinistryRole(authRoles);
    const userEmail = isAdmin ? undefined : authEmail;
    return {
      ministryRole,
      userEmail,
    };
  } catch {
    console.error('An error occurred');
  }
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
