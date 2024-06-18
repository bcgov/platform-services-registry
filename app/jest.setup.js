import 'isomorphic-fetch';
import '@testing-library/jest-dom';
import prisma from '@/core/prisma';
import _ from 'lodash';

jest.setTimeout(75000);

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next-auth', () => ({
  default: jest.fn(),
  NextAuth: jest.fn(),
}));

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  GET: jest.fn(),
  POST: jest.fn(),
}));

// Mock Mautic
jest.mock('@/services/mautic', () => ({
  ...jest.requireActual('@/services/mautic'),
  subscribeUsersToMautic: jest.fn(async () => [200, 200, 200]),
}));

jest.mock('@/services/nats', () => ({
  ...jest.requireActual('@/services/nats'),
  sendPrivateCloudNatsMessage: jest.fn(async () => [200, 200, 200]),
  sendPublicCloudNatsMessage: jest.fn(async () => [200, 200, 200]),
  sendNatsMessage: jest.fn(async () => [200, 200, 200]),
}));

jest.mock('@/services/ches/private-cloud/email-handler', () => ({
  ...jest.requireActual('@/services/ches/private-cloud/email-handler'),
  sendCreateRequestEmails: jest.fn(async () => [200]),
  sendEditRequestEmails: jest.fn(async () => [200]),
  sendRequestApprovalEmails: jest.fn(async () => [200]),
  sendRequestRejectionEmails: jest.fn(async () => [200]),
  sendDeleteRequestEmails: jest.fn(async () => [200]),
  sendDeleteRequestApprovalEmails: jest.fn(async () => [200]),
  sendProvisionedEmails: jest.fn(async () => [200]),
}));

jest.mock('@/services/keycloak/app-realm', () => ({
  getKcAdminClient: jest.fn(async () => null),
  findClient: jest.fn(async () => null),
  findUser: jest.fn(async () => null),
}));

[
  'castArray',
  'compact',
  'forEach',
  'get',
  'isArray',
  'isBoolean',
  'isDate',
  'isEqual',
  'isNil',
  'isNumber',
  'isPlainObject',
  'isString',
  'mapValues',
  'pick',
  'reduce',
  'set',
  'uniq',
].forEach((fnName) => jest.mock(`lodash-es/${fnName}`, () => jest.fn(_[fnName])));

export async function cleanUp() {
  // Delete related documents from referencing models first
  await prisma.privateCloudRequest.deleteMany();
  await prisma.publicCloudRequest.deleteMany();
  await prisma.privateCloudComment.deleteMany();

  // Delete projects
  await prisma.privateCloudProject.deleteMany();
  await prisma.publicCloudProject.deleteMany();

  // Delete requested projects
  await prisma.privateCloudRequestedProject.deleteMany();
  await prisma.publicCloudRequestedProject.deleteMany();

  // Now it should be safe to delete User documents
  await prisma.user.deleteMany();
  await prisma.event.deleteMany();
}

beforeAll(async () => {
  await cleanUp();
});

afterAll(async () => {
  await cleanUp();
});
