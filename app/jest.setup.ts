import 'isomorphic-fetch';
import '@testing-library/jest-dom';
import _ from 'lodash';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { SERVICE_ACCOUNT_DATA, DB_DATA } from './jest.mock';

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

jest.mock('@/services/nats/core', () => ({
  sendNatsMessage: jest.fn(),
}));

jest.mock('@/services/ches/core', () => ({
  sendEmail: jest.fn(),
  safeSendEmail: jest.fn(),
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
  findUser: jest.fn(async () => SERVICE_ACCOUNT_DATA.user),
  findUsersByClientRole: jest.fn(async () => []),
  findUserEmailsByAuthRole: jest.fn(async () => []),
}));

jest.mock('@/helpers/pdfs/emou/index', () => ({
  generateEmouPdf: jest.fn(async () => Buffer.alloc(0)),
}));

jest.mock('@/services/k8s/metrics', () => ({
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

jest.mock('@/services/k8s/reads/deletion-check', () => ({
  checkDeletionAvailability: jest.fn(async () => ({
    namespace: true,
    pods: true,
    pvc: true,
    artifactory: true,
  })),
  isEligibleForDeletion: jest.fn(async () => true),
}));

[
  'castArray',
  'compact',
  'difference',
  'forEach',
  'get',
  'isArray',
  'isBoolean',
  'isDate',
  'isEqual',
  'join',
  'isNil',
  'isNumber',
  'isPlainObject',
  'isString',
  'mapValues',
  'noop',
  'pick',
  'reduce',
  'toLower',
  'toString',
  'set',
  'sum',
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
  await prisma.privateCloudProduct.deleteMany();
  await prisma.publicCloudProduct.deleteMany();

  // Delete requested projects
  await prisma.privateCloudRequestData.deleteMany();
  await prisma.publicCloudRequestData.deleteMany();

  await prisma.publicCloudBilling.deleteMany();

  // Now it should be safe to delete User documents
  await prisma.user.deleteMany();
  await prisma.event.deleteMany();
  await prisma.task.deleteMany();
}

export const sampleMinistries = [
  {
    code: 'AEST',
    name: 'Post-Secondary Education and Future Skills Contacts',
  },
  {
    code: 'AG',
    name: 'Attorney General',
  },
  {
    code: 'AGRI',
    name: 'Agriculture and Food',
  },
  {
    code: 'ALC',
    name: 'Advisory Committee Revitalization',
  },
  {
    code: 'BCPC',
    name: 'British Columbia Provincial Committee',
  },
  {
    code: 'CITZ',
    name: 'Citizens Services',
  },
  {
    code: 'DBC',
    name: 'Drug Benefit Council',
  },
  {
    code: 'EAO',
    name: 'Environmental Assessment Office',
  },
  {
    code: 'EDUC',
    name: 'Education and Child Care',
  },
  {
    code: 'EMCR',
    name: 'Emergency Management and Climate Readiness',
  },
  {
    code: 'EMPR',
    name: 'Energy, Mines and Low Carbon Innovation',
  },
  {
    code: 'ENV',
    name: 'Environment and Climate Change Strategy',
  },
  {
    code: 'FIN',
    name: 'Finance',
  },
  {
    code: 'FLNR',
    name: 'Forests, Lands, Natural Resource',
  },
  {
    code: 'HLTH',
    name: 'Health',
  },
  {
    code: 'IRR',
    name: 'Indigenous Relations & Reconciliation',
  },
  {
    code: 'JEDC',
    name: 'Jobs, Economic Development and Innovation',
  },
  {
    code: 'LBR',
    name: 'Labour',
  },
  {
    code: 'LDB',
    name: 'Liquor Distribution Branch',
  },
  {
    code: 'MCF',
    name: 'Children and Family Development',
  },
  {
    code: 'MMHA',
    name: 'Mental Health and Addictions',
  },
  {
    code: 'PSA',
    name: 'Public Service Agency',
  },
  {
    code: 'PSSG',
    name: 'Public Safety and Solicitor General',
  },
  {
    code: 'SDPR',
    name: 'Social Development and Poverty Reduction',
  },
  {
    code: 'TCA',
    name: 'Tangible Capital Assets',
  },
  {
    code: 'TRAN',
    name: 'Transportation and Infrastructure',
  },
  {
    code: 'HMA',
    name: 'Housing and Municipal Affairs',
  },
  {
    code: 'WLRS',
    name: 'Water, Land and Resource Stewardship',
  },
];

beforeAll(async () => {
  const { mutateMockUsersWithDbUsers } = await import('@/helpers/mock-users');
  await cleanUp();
  await prisma.organization.deleteMany();
  await prisma.organization.createMany({
    data: sampleMinistries,
  });
  DB_DATA.organizations = await prisma.organization.findMany();
  return mutateMockUsersWithDbUsers();
});

afterAll(async () => {
  await cleanUp();
});

logger.transports[0].silent = true;
