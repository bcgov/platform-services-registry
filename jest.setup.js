import "isomorphic-fetch";
import "@testing-library/jest-dom/extend-expect";
import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/prisma";

jest.setTimeout(70000);

export async function cleanUp() {
  // Delete related documents from referencing models first
  await prisma.privateCloudRequest.deleteMany();
  await prisma.publicCloudRequest.deleteMany();

  // Delete projects
  await prisma.privateCloudProject.deleteMany();
  await prisma.publicCloudProject.deleteMany();

  // Delete requested projects
  await prisma.privateCloudRequestedProject.deleteMany();
  await prisma.publicCloudRequestedProject.deleteMany();

  // Now it should be safe to delete User documents
  await prisma.user.deleteMany();
}
// export async function cleanUp() {
//   const deleteRequests = prisma.privateCloudRequest.deleteMany();
//   const deleteProjects = prisma.privateCloudProject.deleteMany();
//   const deleteRequestedProjects =
//     prisma.privateCloudRequestedProject.deleteMany();
//   const deleteUsers = prisma.user.deleteMany();

//   await prisma.$transaction([
//     deleteRequests,
//     deleteProjects,
//     deleteRequestedProjects,
//     deleteUsers,
//   ]);
// }

afterAll(async () => {
  // await cleanUp();
  await prisma.$disconnect();
});

beforeAll(async () => {
  await cleanUp();
});
