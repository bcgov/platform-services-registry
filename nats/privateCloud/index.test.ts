import { prisma } from '@/lib/prisma';
import { PrivateCloudRequest } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { POST } from '@/app/api/private-cloud/create/route';
import { MockedFunction } from 'jest-mock';
import { NextRequest, NextResponse } from 'next/server';
import { PrivateCloudCreateRequestBody } from '@/schema';
import createPrivateCloudNatsMessage from '@/nats/privateCloud';
// import { cleanUp } from "@/jest.setup";

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/create/private-cloud`;

const createRequestBody: PrivateCloudCreateRequestBody = {
  name: 'Sample Project',
  description: 'This is a sample project description.',
  cluster: 'SILVER', // Assuming CLUSTER_A is a valid enum value for Cluster
  ministry: 'AGRI', // Assuming AGRI is a valid enum value for Ministry
  projectOwner: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'oamar.kanji@gov.bc.ca',
    ministry: 'AGRI', // Assuming AGRI is a valid enum value for Ministry
  },
  primaryTechnicalLead: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    ministry: 'AGRI', // Assuming AGRI is a valid enum value for Ministry
  },
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
};

const mockedGetServerSession = getServerSession as unknown as MockedFunction<typeof getServerSession>;

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next-auth', () => ({
  default: jest.fn(), // for default export
  NextAuth: jest.fn(), // for named export
}));

jest.mock('../../app/api/auth/[...nextauth]/route', () => ({
  GET: jest.fn(),
  POST: jest.fn(),
}));

beforeAll(async () => {
  // await cleanUp();

  mockedGetServerSession.mockResolvedValue({
    user: {
      email: 'oamar.kanji@gov.bc.ca',
      roles: [],
    },
  });

  const req = new NextRequest(`${BASE_URL}/api/create/private-cloud`, {
    method: 'POST',
    body: JSON.stringify(createRequestBody),
  });

  await POST(req);

  const request = await prisma.privateCloudRequest.findFirst();

  if (!request) {
    throw new Error('Request not created. Issue in beforeAll');
  }
});

// mockedGetServerSession.mockResolvedValue({
//   user: {
//     email: 'oamar.kanji@gov.bc.ca',
//     roles: [],
//   },
// });

// const req = new NextRequest(API_URL, {
//   method: 'POST',
//   body: JSON.stringify(createRequestBody),
// });

// const response = await POST(req);

describe('Create Private Cloud Request Route', () => {
  test('should create a request with the correct data', async () => {
    const requests: PrivateCloudRequest[] = await prisma.privateCloudRequest.findMany();
    const request: PrivateCloudRequest = requests[0];

    const requestedProject = await prisma.privateCloudRequestedProject.findUnique({
      where: {
        id: request.requestedProjectId,
      },
      include: {
        projectOwner: true,
        primaryTechnicalLead: true,
        secondaryTechnicalLead: true,
      },
    });

    if (!requestedProject) {
      throw new Error('Requested project not found.');
    }

    const natsMessage = await createPrivateCloudNatsMessage(request.id, request.type, requestedProject, false);

    // TODO: Add more assertions
    expect(natsMessage).toBeDefined();

    // console.log(JSON.stringify(natsMessage, null, 2));
  });
});
