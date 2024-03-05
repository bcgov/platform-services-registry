import 'isomorphic-fetch';
import '@testing-library/jest-dom';
import prisma from '@/core/prisma';

jest.setTimeout(75000);

// Mock Mautic
jest.mock('@/services/mautic', () => ({
  ...jest.requireActual('@/services/mautic'),
  subscribeUsersToMautic: jest.fn(async () => [200, 200, 200]), // Mocked return value
}));

// Mock Nats
jest.mock('@/services/nats', () => ({
  sendPrivateCloudNatsMessage: jest.fn(async () => [200, 200, 200]),
  sendPublicCloudNatsMessage: jest.fn(async () => [200, 200, 200]),
  sendNatsMessage: jest.fn(async () => [200, 200, 200]),
}));

// Mock CHES
jest.mock('@/services/ches/private-cloud/email-handler', () => ({
  ...jest.requireActual('@/services/ches/helpers'),
  sendCreateRequestEmails: jest.fn(async () => [200]),
  sendEditRequestEmails: jest.fn(async () => [200]),
  sendRequestApprovalEmails: jest.fn(async () => [200]),
  sendRequestRejectionEmails: jest.fn(async () => [200]),
  sendDeleteRequestEmails: jest.fn(async () => [200]),
  sendDeleteRequestApprovalEmails: jest.fn(async () => [200]),
  sendProvisionedEmails: jest.fn(async () => [200]),
}));

jest.mock('@/services/ches/private-cloud/email-handler', () => ({
  ...jest.requireActual('@/services/ches/helpers'),
  sendCreateRequestEmails: jest.fn(async () => [200]),
  sendEditRequestEmails: jest.fn(async () => [200]),
  sendRequestApprovalEmails: jest.fn(async () => [200]),
  sendRequestRejectionEmails: jest.fn(async () => [200]),
  sendDeleteRequestEmails: jest.fn(async () => [200]),
  sendDeleteRequestApprovalEmails: jest.fn(async () => [200]),
  sendProvisionedEmails: jest.fn(async () => [200]),
}));

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

afterAll(async () => {
  await cleanUp();
  await prisma.$disconnect();
});

// beforeAll(async () => {
//   await cleanUp();
// });
