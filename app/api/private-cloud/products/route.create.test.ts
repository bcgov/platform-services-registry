import { expect } from '@jest/globals';
import { PrivateCloudRequest } from '@prisma/client';
import { MockedFunction } from 'jest-mock';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { POST } from '@/app/api/private-cloud/products/route';
import prisma from '@/core/prisma';
import { findMockUserByIDIR, generateTestSession } from '@/helpers/mock-users';
import { PrivateCloudCreateRequestBody } from '@/schema';

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/private-cloud/create`;

const createRequestBody: PrivateCloudCreateRequestBody = {
  name: 'Sample Project',
  description: 'This is a sample project description.',
  cluster: 'SILVER', // Assuming CLUSTER_A is a valid enum value for Cluster
  ministry: 'AGRI', // Assuming AGRI is a valid enum value for Ministry
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

describe('Create Private Cloud Request Route', () => {
  test('should return 401 if user is not authenticated', async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const req = new NextRequest(API_URL, {
      method: 'POST',
      body: JSON.stringify(createRequestBody),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
  });

  test('should return 200 if request is created', async () => {
    const mockSession = await generateTestSession(createRequestBody.projectOwner.email);
    mockedGetServerSession.mockResolvedValue(mockSession);

    const requestsBefore = await prisma.privateCloudRequest.findMany();

    const req = new NextRequest(API_URL, {
      method: 'POST',
      body: JSON.stringify(createRequestBody),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const requestsAfter = await prisma.privateCloudRequest.findMany();

    expect(requestsAfter.length).toBe(requestsBefore.length + 1);
  });

  test('should create a request with the correct data', async () => {
    const requests = await prisma.privateCloudRequest.findMany();
    const request = requests[0];

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

    expect(decisionData.name).toBe(createRequestBody.name);
    expect(decisionData.description).toBe(createRequestBody.description);
    expect(decisionData.cluster).toBe(createRequestBody.cluster);
    expect(decisionData.ministry).toBe(createRequestBody.ministry);
    expect(decisionData.projectOwner.firstName).toBe(createRequestBody.projectOwner.firstName);
    expect(decisionData.projectOwner.lastName).toBe(createRequestBody.projectOwner.lastName);
    expect(decisionData.projectOwner.email).toBe(createRequestBody.projectOwner.email);
    expect(decisionData.projectOwner.ministry).toBe(createRequestBody.projectOwner.ministry);
    expect(decisionData.primaryTechnicalLead.firstName).toBe(createRequestBody.primaryTechnicalLead.firstName);
    expect(decisionData.primaryTechnicalLead.lastName).toBe(createRequestBody.primaryTechnicalLead.lastName);
    expect(decisionData.primaryTechnicalLead.email).toBe(createRequestBody.primaryTechnicalLead.email);
    expect(decisionData.primaryTechnicalLead.ministry).toBe(createRequestBody.primaryTechnicalLead.ministry);
    expect(decisionData.secondaryTechnicalLead).toBeNull();
    expect(decisionData.commonComponents.addressAndGeolocation.planningToUse).toBe(
      createRequestBody.commonComponents.addressAndGeolocation.planningToUse,
    );
    expect(decisionData.commonComponents.addressAndGeolocation.implemented).toBe(
      createRequestBody.commonComponents.addressAndGeolocation.implemented,
    );
    expect(decisionData.commonComponents.workflowManagement.planningToUse).toBe(
      createRequestBody.commonComponents.workflowManagement.planningToUse,
    );
    expect(decisionData.commonComponents.workflowManagement.implemented).toBe(
      createRequestBody.commonComponents.workflowManagement.implemented,
    );
    expect(decisionData.commonComponents.formDesignAndSubmission.planningToUse).toBe(
      createRequestBody.commonComponents.formDesignAndSubmission.planningToUse,
    );
    expect(decisionData.commonComponents.publishing.implemented).toBe(
      createRequestBody.commonComponents.formDesignAndSubmission.implemented,
    );
    expect(decisionData.commonComponents.identityManagement.planningToUse).toBe(
      createRequestBody.commonComponents.identityManagement.planningToUse,
    );
    expect(decisionData.commonComponents.identityManagement.implemented).toBe(
      createRequestBody.commonComponents.identityManagement.implemented,
    );
    expect(decisionData.commonComponents.paymentServices.planningToUse).toBe(
      createRequestBody.commonComponents.paymentServices.planningToUse,
    );
    expect(decisionData.commonComponents.paymentServices.implemented).toBe(
      createRequestBody.commonComponents.paymentServices.implemented,
    );
    expect(decisionData.commonComponents.documentManagement.planningToUse).toBe(
      createRequestBody.commonComponents.documentManagement.planningToUse,
    );
    expect(decisionData.commonComponents.documentManagement.implemented).toBe(
      createRequestBody.commonComponents.documentManagement.implemented,
    );
    expect(decisionData.commonComponents.endUserNotificationAndSubscription.planningToUse).toBe(
      createRequestBody.commonComponents.endUserNotificationAndSubscription.planningToUse,
    );
    expect(decisionData.commonComponents.endUserNotificationAndSubscription.implemented).toBe(
      createRequestBody.commonComponents.endUserNotificationAndSubscription.implemented,
    );
    expect(decisionData.commonComponents.publishing.planningToUse).toBe(
      createRequestBody.commonComponents.publishing.planningToUse,
    );
    expect(decisionData.commonComponents.publishing.implemented).toBe(
      createRequestBody.commonComponents.publishing.implemented,
    );
    expect(decisionData.commonComponents.businessIntelligence.planningToUse).toBe(
      createRequestBody.commonComponents.businessIntelligence.planningToUse,
    );
    expect(decisionData.commonComponents.businessIntelligence.implemented).toBe(
      createRequestBody.commonComponents.businessIntelligence.implemented,
    );
    expect(decisionData.commonComponents.other).toBe(createRequestBody.commonComponents.other);
    expect(decisionData.commonComponents.noServices).toBe(createRequestBody.commonComponents.noServices);
  });
});
