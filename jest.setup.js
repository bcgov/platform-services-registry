import "isomorphic-fetch";
import "@testing-library/jest-dom/extend-expect";
import { PrismaClient } from "@prisma/client";

jest.setTimeout(30000);

export const prisma = new PrismaClient();

async function cleanUp() {
  await prisma.user.deleteMany();
  await prisma.privateCloudRequestedProject.deleteMany();
  await prisma.privateCloudProject.deleteMany();
  await prisma.privateCloudRequest.deleteMany();
}

afterAll(async () => {
  await cleanUp();
  await prisma.$disconnect();
});
