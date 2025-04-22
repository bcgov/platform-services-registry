import { PrismaClient } from '@/prisma/types';

const prisma = new PrismaClient();

async function main() {
  console.log('// TODO');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
