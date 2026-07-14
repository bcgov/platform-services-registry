/**
 * Seed MongoDB for local development: ministries (organizations) and mock users.
 * Run: pnpm run seed-local (from app/, after sandbox + prisma db push)
 */
import prisma from '../core/prisma';
import { seedFoundation } from './seed-foundation';

async function main() {
  await seedFoundation();
  console.log('\nLocal dev seed complete. Refresh the app and try creating a product again.');
  console.log('For team contacts, search users by email (3+ chars), e.g. "admin.system" or "gov.bc".');
  console.log('For full seed with Azure product: pnpm run seed-all-local');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
