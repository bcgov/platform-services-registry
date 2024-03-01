import prisma from '@/core/prisma';
import { PrivateCloudRequest } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { POST } from '@/app/api/private-cloud/create/route';
import { MockedFunction } from 'jest-mock';
import { NextRequest, NextResponse } from 'next/server';
import { PrivateCloudCreateRequestBody } from '@/schema';
// import { cleanUp } from "@/jest.setup";
import { expect } from '@jest/globals';
import { findMockUserByIDIR } from '@/helpers/mock-users';

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
};

const mockedGetServerSession = getServerSession as unknown as MockedFunction<typeof getServerSession>;

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next-auth', () => ({
  default: jest.fn(), // for default export
  NextAuth: jest.fn(), // for named export
}));

jest.mock('../../auth/[...nextauth]/route', () => ({
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
    mockedGetServerSession.mockResolvedValue({
      user: {
        email: createRequestBody.projectOwner.email,
      },
      roles: ['user'],
      isAdmin: false,
    });

    const requestsBefore: PrivateCloudRequest[] = await prisma.privateCloudRequest.findMany();

    const req = new NextRequest(API_URL, {
      method: 'POST',
      body: JSON.stringify(createRequestBody),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const requestsAfter: PrivateCloudRequest[] = await prisma.privateCloudRequest.findMany();

    expect(requestsAfter.length).toBe(requestsBefore.length + 1);
  });

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

    expect(requestedProject.name).toBe(createRequestBody.name);
    expect(requestedProject.description).toBe(createRequestBody.description);
    expect(requestedProject.cluster).toBe(createRequestBody.cluster);
    expect(requestedProject.ministry).toBe(createRequestBody.ministry);
    expect(requestedProject.projectOwner.firstName).toBe(createRequestBody.projectOwner.firstName);
    expect(requestedProject.projectOwner.lastName).toBe(createRequestBody.projectOwner.lastName);
    expect(requestedProject.projectOwner.email).toBe(createRequestBody.projectOwner.email);
    expect(requestedProject.projectOwner.ministry).toBe(createRequestBody.projectOwner.ministry);
    expect(requestedProject.primaryTechnicalLead.firstName).toBe(createRequestBody.primaryTechnicalLead.firstName);
    expect(requestedProject.primaryTechnicalLead.lastName).toBe(createRequestBody.primaryTechnicalLead.lastName);
    expect(requestedProject.primaryTechnicalLead.email).toBe(createRequestBody.primaryTechnicalLead.email);
    expect(requestedProject.primaryTechnicalLead.ministry).toBe(createRequestBody.primaryTechnicalLead.ministry);
    expect(requestedProject.secondaryTechnicalLead).toBeNull();
    expect(requestedProject.commonComponents.addressAndGeolocation.planningToUse).toBe(
      createRequestBody.commonComponents.addressAndGeolocation.planningToUse,
    );
    expect(requestedProject.commonComponents.addressAndGeolocation.implemented).toBe(
      createRequestBody.commonComponents.addressAndGeolocation.implemented,
    );
    expect(requestedProject.commonComponents.workflowManagement.planningToUse).toBe(
      createRequestBody.commonComponents.workflowManagement.planningToUse,
    );
    expect(requestedProject.commonComponents.workflowManagement.implemented).toBe(
      createRequestBody.commonComponents.workflowManagement.implemented,
    );
    expect(requestedProject.commonComponents.formDesignAndSubmission.planningToUse).toBe(
      createRequestBody.commonComponents.formDesignAndSubmission.planningToUse,
    );
    expect(requestedProject.commonComponents.formDesignAndSubmission.implemented).toBe(
      createRequestBody.commonComponents.formDesignAndSubmission.implemented,
    );
    expect(requestedProject.commonComponents.identityManagement.planningToUse).toBe(
      createRequestBody.commonComponents.identityManagement.planningToUse,
    );
    expect(requestedProject.commonComponents.identityManagement.implemented).toBe(
      createRequestBody.commonComponents.identityManagement.implemented,
    );
    expect(requestedProject.commonComponents.paymentServices.planningToUse).toBe(
      createRequestBody.commonComponents.paymentServices.planningToUse,
    );
    expect(requestedProject.commonComponents.paymentServices.implemented).toBe(
      createRequestBody.commonComponents.paymentServices.implemented,
    );
    expect(requestedProject.commonComponents.documentManagement.planningToUse).toBe(
      createRequestBody.commonComponents.documentManagement.planningToUse,
    );
    expect(requestedProject.commonComponents.documentManagement.implemented).toBe(
      createRequestBody.commonComponents.documentManagement.implemented,
    );
    expect(requestedProject.commonComponents.endUserNotificationAndSubscription.planningToUse).toBe(
      createRequestBody.commonComponents.endUserNotificationAndSubscription.planningToUse,
    );
    expect(requestedProject.commonComponents.endUserNotificationAndSubscription.implemented).toBe(
      createRequestBody.commonComponents.endUserNotificationAndSubscription.implemented,
    );
    expect(requestedProject.commonComponents.publishing.planningToUse).toBe(
      createRequestBody.commonComponents.publishing.planningToUse,
    );
    expect(requestedProject.commonComponents.publishing.implemented).toBe(
      createRequestBody.commonComponents.publishing.implemented,
    );
    expect(requestedProject.commonComponents.businessIntelligence.planningToUse).toBe(
      createRequestBody.commonComponents.businessIntelligence.planningToUse,
    );
    expect(requestedProject.commonComponents.businessIntelligence.implemented).toBe(
      createRequestBody.commonComponents.businessIntelligence.implemented,
    );
    expect(requestedProject.commonComponents.other).toBe(createRequestBody.commonComponents.other);
    expect(requestedProject.commonComponents.noServices).toBe(createRequestBody.commonComponents.noServices);
  });
});
