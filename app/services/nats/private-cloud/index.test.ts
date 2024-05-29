import { PrivateCloudRequest } from '@prisma/client';
import { MockedFunction } from 'jest-mock';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { POST } from '@/app/api/private-cloud/products/route';
import prisma from '@/core/prisma';
import { findMockUserByIDIR, generateTestSession } from '@/helpers/mock-users';
import { createProxyUsers } from '@/queries/users';
import { PrivateCloudCreateRequestBody } from '@/schema';
import createPrivateCloudNatsMessage from '@/services/nats/private-cloud';

const BASE_URL = 'http://localhost:3000';

const createRequestBody: PrivateCloudCreateRequestBody = {
  name: 'Sample Project',
  description: 'This is a sample project description.',
  cluster: 'SILVER',
  ministry: 'AGRI',
  projectOwner: findMockUserByIDIR('JOHNDOE'),
  primaryTechnicalLead: findMockUserByIDIR('JAMESSMITH'),
  commonComponents: {
    addressAndGeolocation: {
      planningToUse: true,
      implemented: false,
    },
    workflowManagement: {
      planningToUse: false,
      implemented: true,
    },
    formDesignAndSubmission: {
      planningToUse: true,
      implemented: true,
    },
    identityManagement: {
      planningToUse: false,
      implemented: false,
    },
    paymentServices: {
      planningToUse: true,
      implemented: false,
    },
    documentManagement: {
      planningToUse: false,
      implemented: true,
    },
    endUserNotificationAndSubscription: {
      planningToUse: true,
      implemented: false,
    },
    publishing: {
      planningToUse: false,
      implemented: true,
    },
    businessIntelligence: {
      planningToUse: true,
      implemented: false,
    },
    other: 'Some other services',
    noServices: false,
  },
  golddrEnabled: true,
  isTest: false,
};

const mockedGetServerSession = getServerSession as unknown as MockedFunction<typeof getServerSession>;

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next-auth', () => ({
  default: jest.fn(), // for default export
  NextAuth: jest.fn(), // for named export
}));

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  GET: jest.fn(),
  POST: jest.fn(),
}));

beforeAll(async () => {
  await createProxyUsers();

  const mockSession = await generateTestSession(createRequestBody.projectOwner.email);
  mockedGetServerSession.mockResolvedValue(mockSession);

  const req = new NextRequest(`${BASE_URL}/api/private-cloud/products`, {
    method: 'POST',
    body: JSON.stringify(createRequestBody),
  });

  await POST(req);

  const request = await prisma.privateCloudRequest.findFirst();

  if (!request) {
    throw new Error('Request not created. Issue in beforeAll');
  }
});

describe('Create Private Cloud Request Route', () => {
  test('should create a request with the correct data', async () => {
    const requests: PrivateCloudRequest[] = await prisma.privateCloudRequest.findMany();
    const request: PrivateCloudRequest = requests[0];

    const decisionData = await prisma.privateCloudRequestedProject.findUnique({
      where: {
        id: request.decisionDataId,
      },
      include: {
        projectOwner: true,
        primaryTechnicalLead: true,
        secondaryTechnicalLead: true,
      },
    });

    if (!decisionData) {
      throw new Error('Requested project not found.');
    }

    const natsMessage = await createPrivateCloudNatsMessage(request.id, request.type, decisionData, false);

    // TODO: Add more assertions
    expect(natsMessage).toBeDefined();
  });
});
