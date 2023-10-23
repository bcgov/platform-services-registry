import { User } from '@prisma/client';
import prisma from '@/lib/prisma';

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
