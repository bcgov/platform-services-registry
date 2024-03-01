import { User } from '@prisma/client';
import prisma from '@/core/prisma';

export function userInfo(
  userSessionEmail: string,
  userRoles: string[],
): {
  userEmail: string | undefined;
  ministryRoles: string[];
} {
  const isAdmin = userRoles.includes('admin');
  const ministryRoles = userRoles
    .filter((role: string) => role.startsWith('ministry') && role.indexOf('admin', role.length - 5) !== -1)
    .map((role: string) => role.split('-')[1].toLocaleUpperCase());
  const userEmail = isAdmin ? undefined : userSessionEmail;
  return {
    userEmail,
    ministryRoles,
  };
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
