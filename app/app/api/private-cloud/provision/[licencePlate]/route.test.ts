import { NextRequest, NextResponse } from 'next/server';
import { PUT } from '@/app/api/private-cloud/provision/[licencePlate]/route';
import { POST as decisionRequest } from '@/app/api/private-cloud/requests/[id]/decision/route';
import prisma from '@/core/prisma';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { findMockUserByIDIR, generateTestSession } from '@/helpers/mock-users';
import { cpuOptions, memoryOptions, storageOptions } from '@/schema';
import { mockedGetServerSession } from '@/services/api-test/core';
import { createPrivateCloudProject } from '@/services/api-test/private-cloud/products';

const BASE_URL = 'http://localhost:3000';

const createRequestBody = createSamplePrivateCloudProductData();

const adminChanges = {
  name: 'New name from admin',
  description: 'New description from admin',
  projectOwner: findMockUserByIDIR('JOHNDOE'),
  testQuota: {
    cpu: cpuOptions[1],
    memory: memoryOptions[1],
    storage: storageOptions[1],
  },
};

const decisionBody = {
  ...createRequestBody,
  ...adminChanges,
  decision: 'APPROVED',
  decisionComment: 'Approved by admin',
};

describe('Create Private Cloud Request Route', () => {
  let createRequestId: string;
  let createRequestLicencePlate: string;
  let PROVISION_API_URL: string;

  beforeAll(async () => {
    // await cleanUp();

    const mockSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockSession);

    await createPrivateCloudProject(createRequestBody);

    // Get the request id
    const request = await prisma.privateCloudRequest.findFirst();

    if (!request) {
      throw new Error('Request not found for provision test.');
    }

    createRequestId = request.id;
    createRequestLicencePlate = request.licencePlate;

    // Make a decision request
    const DECISION_API_URL = `${BASE_URL}/api/private-cloud/requests/${createRequestId}/decision`;

    const decisionRequestObject = new NextRequest(DECISION_API_URL, {
      method: 'POST',
      body: JSON.stringify(decisionBody),
    });

    await decisionRequest(decisionRequestObject, {
      params: { id: createRequestId },
    });

    // Create the proviiion request url
    PROVISION_API_URL = `${BASE_URL}/api/provision/private-cloud/${createRequestLicencePlate}`;
  });

  afterAll(async () => {
    // await cleanUp();
  });

  // test("should return 401 if user is not authenticated", async () => {
  //   mockedGetServerSession.mockResolvedValue(null);

  //   const req = new NextRequest(API_URL, {
  //     method: "PUT",
  //   });

  //   const response = await PUT(req, {
  //     params: { licencePlate: createRequestLicencePlate },
  //   });

  //   expect(response.status).toBe(401);
  // });

  // test("should return 403 if not an admin", async () => {
  //   mockedGetServerSession.mockResolvedValue({
  //     user: {
  //       email: "oamar.kanji@gov.bc.ca",
  //       roles: [],
  //     },
  //   });

  //   const req = new NextRequest(API_URL, {
  //     method: "POST",
  //     body: JSON.stringify(createRequestBody),
  //   });

  //   const response = await PUT(req, {
  //     params: { licencePlate: createRequestLicencePlate },
  //   });

  //   expect(response.status).toBe(403);
  // });

  test('should return 200 if provision is successful', async () => {
    const req = new NextRequest(PROVISION_API_URL, {
      method: 'PUT',
    });

    const response = await PUT(req, {
      params: { licencePlate: createRequestLicencePlate },
    });
    expect(response.status).toBe(200);
  });

  test('should be a project in the db', async () => {
    const project = await prisma.privateCloudProject.findFirst({
      where: { licencePlate: createRequestLicencePlate },
      include: {
        projectOwner: true,
        primaryTechnicalLead: true,
        secondaryTechnicalLead: true,
      },
    });

    if (!project) {
      throw new Error('Project not found in db');
    }

    expect(project).toBeTruthy();
    expect(project.licencePlate).toBe(createRequestLicencePlate);
    expect(project.name).toBe(decisionBody.name);
    expect(project.description).toBe(decisionBody.description);
    expect(project.cluster).toBe(decisionBody.cluster);
    expect(project.ministry).toBe(decisionBody.ministry);
    expect(project.projectOwner.email).toBe(decisionBody.projectOwner.email);
    expect(project.primaryTechnicalLead.email).toBe(decisionBody.primaryTechnicalLead.email);
    expect(project.secondaryTechnicalLead?.email).toBe(decisionBody.secondaryTechnicalLead.email);
    expect(project.commonComponents).toBeTruthy();
    expect(project.testQuota).toStrictEqual(decisionBody.testQuota);
    expect(project.productionQuota).toStrictEqual(decisionBody.productionQuota);
    expect(project.toolsQuota).toStrictEqual(decisionBody.toolsQuota);
    expect(project.developmentQuota).toStrictEqual(decisionBody.developmentQuota);
  });

  test('the request should be marked as provisioned and not be active', async () => {
    const request = await prisma.privateCloudRequest.findFirst({
      where: { licencePlate: createRequestLicencePlate },
    });

    if (!request) {
      throw new Error('Request not found in db');
    }

    expect(request.decisionStatus).toBe('PROVISIONED');
    expect(request.active).toBe(false);
  });
});
