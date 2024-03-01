import prisma from '@/core/prisma';
import { DefaultCpuOptionsSchema, DefaultMemoryOptionsSchema, DefaultStorageOptionsSchema } from '@/schema';
import { getServerSession } from 'next-auth/next';
import { POST as createRequest } from '@/app/api/private-cloud/create/route';
import { POST } from '@/app/api/private-cloud/decision/[licencePlate]/route';
import { MockedFunction } from 'jest-mock';
import { NextRequest, NextResponse } from 'next/server';
// import { cleanUp } from "@/jest.setup";
import { expect } from '@jest/globals';
import { findMockUserByIDIR } from '@/helpers/mock-users';

const BASE_URL = 'http://localhost:3000';

const createRequestBody = {
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

const quota = {
  cpu: DefaultCpuOptionsSchema.enum.CPU_REQUEST_0_5_LIMIT_1_5,
  memory: DefaultMemoryOptionsSchema.enum.MEMORY_REQUEST_2_LIMIT_4,
  storage: DefaultStorageOptionsSchema.enum.STORAGE_1,
};

const adminChanges = {
  name: 'New name from admin',
  description: 'New description from admin',
  projectOwner: findMockUserByIDIR('JOHNDOE'),
  testQuota: {
    cpu: 'CPU_REQUEST_8_LIMIT_16',
    memory: 'MEMORY_REQUEST_4_LIMIT_8',
    storage: 'STORAGE_3', // Custom Quota
  },
};

const decisionBody = {
  decision: 'APPROVED',
  decisionComment: 'Approved by admin',
  ...createRequestBody,
  productionQuota: quota,
  toolsQuota: quota,
  developmentQuota: quota,
  ...adminChanges,
};

const adminRequestedProjectBody = { ...createRequestBody, ...adminChanges };

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
  let createRequestLicencePlate: string;
  let API_URL: string;

  beforeAll(async () => {
    // await cleanUp();

    mockedGetServerSession.mockResolvedValue({
      user: {
        email: createRequestBody.projectOwner.email,
      },
      roles: ['user'],
      isAdmin: false,
    });

    const req = new NextRequest(`${BASE_URL}/api/private-cloud/create`, {
      method: 'POST',
      body: JSON.stringify(createRequestBody),
    });

    await createRequest(req);
    const request = await prisma.privateCloudRequest.findFirst();

    if (!request) {
      throw new Error('Request not created. Issue in beforeAll');
    }

    createRequestLicencePlate = request?.licencePlate;
    API_URL = `${BASE_URL}/api/private-cloud/decision/${createRequestLicencePlate}`;
  });

  afterAll(async () => {
    // await cleanUp();
  });

  test('should return 401 if user is not authenticated', async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const req = new NextRequest(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        decision: 'APPROVED',
        decisionComment: 'Approved by admin',
        ...adminRequestedProjectBody,
      }),
    });

    const response = await POST(req, {
      params: { licencePlate: createRequestLicencePlate },
    });
    expect(response.status).toBe(401);
  });

  test('should return 403 if not an admin', async () => {
    mockedGetServerSession.mockResolvedValue({
      user: {
        email: createRequestBody.projectOwner.email,
      },
      roles: ['user'],
      isAdmin: false,
    });

    const req = new NextRequest(API_URL, {
      method: 'POST',
      body: JSON.stringify(createRequestBody),
    });

    const response = await POST(req, {
      params: { licencePlate: createRequestLicencePlate },
    });

    expect(response.status).toBe(403);
  });

  test('should return 200 if decision request is successful', async () => {
    mockedGetServerSession.mockResolvedValue({
      user: {
        email: createRequestBody.projectOwner.email,
      },
      roles: ['user', 'admin'],
      isAdmin: true,
    });

    const req = new NextRequest(API_URL, {
      method: 'POST',
      body: JSON.stringify(decisionBody),
    });

    const response = await POST(req, {
      params: { licencePlate: createRequestLicencePlate },
    });

    expect(response.status).toBe(200);
  });

  test('should create a request with the correct data in userRequestedProject', async () => {
    const requests = await prisma.privateCloudRequest.findMany();

    const request = requests[0];

    const requestedProject = await prisma.privateCloudRequestedProject.findUnique({
      where: {
        id: request.userRequestedProjectId || undefined,
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

  test('should create a request with the correct data requestedProject', async () => {
    const requests = await prisma.privateCloudRequest.findMany();

    const request = requests[0];

    const requestedProject = await prisma.privateCloudRequestedProject.findUnique({
      where: {
        id: request.requestedProjectId || undefined,
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

    expect(requestedProject.name).toBe(decisionBody.name);
    expect(requestedProject.description).toBe(decisionBody.description);
    expect(requestedProject.cluster).toBe(decisionBody.cluster);
    expect(requestedProject.ministry).toBe(decisionBody.ministry);
    expect(requestedProject.projectOwner.firstName).toBe(decisionBody.projectOwner.firstName);
    expect(requestedProject.projectOwner.lastName).toBe(decisionBody.projectOwner.lastName);
    expect(requestedProject.projectOwner.email).toBe(decisionBody.projectOwner.email);
    expect(requestedProject.projectOwner.ministry).toBe(decisionBody.projectOwner.ministry);
    expect(requestedProject.primaryTechnicalLead.firstName).toBe(decisionBody.primaryTechnicalLead.firstName);
    expect(requestedProject.primaryTechnicalLead.lastName).toBe(decisionBody.primaryTechnicalLead.lastName);
    expect(requestedProject.primaryTechnicalLead.email).toBe(decisionBody.primaryTechnicalLead.email);
    expect(requestedProject.primaryTechnicalLead.ministry).toBe(decisionBody.primaryTechnicalLead.ministry);
    expect(requestedProject.secondaryTechnicalLead).toBeNull();
    expect(requestedProject.commonComponents.addressAndGeolocation.planningToUse).toBe(
      decisionBody.commonComponents.addressAndGeolocation.planningToUse,
    );
    expect(requestedProject.commonComponents.addressAndGeolocation.implemented).toBe(
      decisionBody.commonComponents.addressAndGeolocation.implemented,
    );
    expect(requestedProject.commonComponents.workflowManagement.planningToUse).toBe(
      decisionBody.commonComponents.workflowManagement.planningToUse,
    );
    expect(requestedProject.commonComponents.workflowManagement.implemented).toBe(
      decisionBody.commonComponents.workflowManagement.implemented,
    );
    expect(requestedProject.commonComponents.formDesignAndSubmission.planningToUse).toBe(
      decisionBody.commonComponents.formDesignAndSubmission.planningToUse,
    );
    expect(requestedProject.commonComponents.formDesignAndSubmission.implemented).toBe(
      decisionBody.commonComponents.formDesignAndSubmission.implemented,
    );
    expect(requestedProject.commonComponents.identityManagement.planningToUse).toBe(
      decisionBody.commonComponents.identityManagement.planningToUse,
    );
    expect(requestedProject.commonComponents.identityManagement.implemented).toBe(
      decisionBody.commonComponents.identityManagement.implemented,
    );
    expect(requestedProject.commonComponents.paymentServices.planningToUse).toBe(
      decisionBody.commonComponents.paymentServices.planningToUse,
    );
    expect(requestedProject.commonComponents.paymentServices.implemented).toBe(
      decisionBody.commonComponents.paymentServices.implemented,
    );
    expect(requestedProject.commonComponents.documentManagement.planningToUse).toBe(
      decisionBody.commonComponents.documentManagement.planningToUse,
    );
    expect(requestedProject.commonComponents.documentManagement.implemented).toBe(
      decisionBody.commonComponents.documentManagement.implemented,
    );
    expect(requestedProject.commonComponents.endUserNotificationAndSubscription.planningToUse).toBe(
      decisionBody.commonComponents.endUserNotificationAndSubscription.planningToUse,
    );
    expect(requestedProject.commonComponents.endUserNotificationAndSubscription.implemented).toBe(
      decisionBody.commonComponents.endUserNotificationAndSubscription.implemented,
    );
    expect(requestedProject.commonComponents.publishing.planningToUse).toBe(
      decisionBody.commonComponents.publishing.planningToUse,
    );
    expect(requestedProject.commonComponents.publishing.implemented).toBe(
      decisionBody.commonComponents.publishing.implemented,
    );
    expect(requestedProject.commonComponents.businessIntelligence.planningToUse).toBe(
      decisionBody.commonComponents.businessIntelligence.planningToUse,
    );
    expect(requestedProject.commonComponents.businessIntelligence.implemented).toBe(
      decisionBody.commonComponents.businessIntelligence.implemented,
    );
    expect(requestedProject.commonComponents.other).toBe(decisionBody.commonComponents.other);
    expect(requestedProject.commonComponents.noServices).toBe(decisionBody.commonComponents.noServices);
  });
});
