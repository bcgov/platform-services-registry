import "isomorphic-fetch";
import "@testing-library/jest-dom/extend-expect";
import { PrismaClient } from "@prisma/client";

jest.setTimeout(30000);

export const prisma = new PrismaClient();

async function cleanUp() {
  const deleteRequests = prisma.privateCloudRequest.deleteMany();
  const deleteProjects = prisma.privateCloudProject.deleteMany();
  const deleteRequestedProjects =
    prisma.privateCloudRequestedProject.deleteMany();
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([
    deleteRequests,
    deleteProjects,
    deleteRequestedProjects,
    deleteUsers,
  ]);
}

afterAll(async () => {
  await cleanUp();
  await prisma.$disconnect();
});
