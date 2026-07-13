import { readFileSync } from 'fs';
import path from 'path';
import type { MsUser } from '../../sandbox/types';
import { sampleMinistries } from '../constants/common';
import prisma from '../core/prisma';
import { processMsUser } from '../services/msgraph';

const mockUsersPath = path.join(__dirname, '../../sandbox/mock-users.json');
const msUsers: MsUser[] = JSON.parse(readFileSync(mockUsersPath, 'utf-8'));

async function seedUsers() {
  for (const usr of msUsers) {
    const appUser = processMsUser(usr);
    if (!appUser) continue;

    const data = {
      firstName: appUser.firstName,
      lastName: appUser.lastName,
      email: appUser.email,
      ministry: appUser.ministry,
      idir: appUser.idir,
      idirGuid: appUser.idirGuid,
      upn: appUser.upn,
      image: '',
    };

    await prisma.user.upsert({
      where: { idirGuid: appUser.idirGuid },
      update: data,
      create: data,
    });
  }
}

export async function seedFoundation() {
  console.log('Seeding organizations (ministries)...');
  for (const ministry of sampleMinistries) {
    await prisma.organization.upsert({
      where: { code: ministry.code },
      update: { name: ministry.name },
      create: ministry,
    });
  }
  const orgCount = await prisma.organization.count();
  console.log(`  ${orgCount} organizations in database`);

  console.log('Seeding mock users from sandbox/mock-users.json...');
  await seedUsers();
  const userCount = await prisma.user.count();
  console.log(`  ${userCount} users in database`);
}
