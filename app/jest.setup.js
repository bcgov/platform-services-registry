import 'isomorphic-fetch';
import '@testing-library/jest-dom';
import prisma from '@/core/prisma';
import { logger } from '@/core/logging';
import _ from 'lodash';
import { SERVICES_KEYCLOAK_APP_REALM } from './jest.mock';

jest.setTimeout(75000);

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(async () => null),
}));

jest.mock('next-auth', () => ({
  default: jest.fn(),
  NextAuth: jest.fn(),
}));

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  GET: jest.fn(),
  POST: jest.fn(),
}));

jest.mock('@/services/mautic', () => ({
  ...jest.requireActual('@/services/mautic'),
  subscribeUsersToMautic: jest.fn(async () => [200, 200, 200]),
}));

jest.mock('@/services/nats/core', () => ({
  sendNatsMessage: jest.fn(),
}));

jest.mock('@/services/ches/private-cloud', () => ({
  ...jest.requireActual('@/services/ches/private-cloud'),
  sendCreateRequestEmails: jest.fn(async () => [200]),
  sendEditRequestEmails: jest.fn(async () => [200]),
  sendRequestApprovalEmails: jest.fn(async () => [200]),
  sendRequestRejectionEmails: jest.fn(async () => [200]),
  sendDeleteRequestEmails: jest.fn(async () => [200]),
  sendDeleteRequestApprovalEmails: jest.fn(async () => [200]),
  sendProvisionedEmails: jest.fn(async () => [200]),
  sendRequestReviewEmails: jest.fn(async () => [200]),
  sendEmouServiceAgreementEmail: jest.fn(async () => [200]),
}));

jest.mock('@/services/keycloak/app-realm', () => ({
  getKcAdminClient: jest.fn(async () => null),
  findClient: jest.fn(async () => null),
  findUser: jest.fn(async () => SERVICES_KEYCLOAK_APP_REALM.findUser),
  findUsersByClientRole: jest.fn(async () => []),
}));

jest.mock('@/utils/jwt', () => ({
  verifyKeycloakJwtTokenSafe: jest.fn(async () => ({ service_account_type: 'user', 'kc-userid': 'xxxxxxxxxxxx' })),
}));

jest.mock('@/helpers/pdfs/emou/index', () => ({
  generateEmouPdf: jest.fn(async () => Buffer.alloc(0)),
}));

jest.mock('@/services/k8s', () => ({
  ...jest.requireActual('@/services/k8s'),
  getResourceDetails: jest.fn(async () => ({
    env: 'dev',
    allocation: {
      request: -1,
      limit: -1,
    },
    deployment: {
      request: -1,
      limit: -1,
      usage: -1,
    },
  })),
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
  'toLower',
  'toString',
  'set',
  'uniq',
  'kebabCase',
  'trim',
  'flatMap',
  'orderBy',
  'groupBy',
  'each',
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
  await prisma.task.deleteMany();
  await prisma.billing.deleteMany();
}

beforeAll(async () => {
  await cleanUp();
});

afterAll(async () => {
  await cleanUp();
});

logger.transports[0].silent = true;
