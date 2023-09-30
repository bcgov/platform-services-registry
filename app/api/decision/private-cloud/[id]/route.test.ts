import { prisma } from "@/lib/prisma";
import {
  DefaultCpuOptions,
  DefaultMemoryOptions,
  DefaultStorageOptions,
} from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { POST as createRequest } from "@/app/api/create/private-cloud/route";
import { POST } from "@/app/api/decision/private-cloud/[id]/route";
import { MockedFunction } from "jest-mock";
import { NextRequest, NextResponse } from "next/server";
// import { cleanUp } from "@/jest.setup";

const BASE_URL = "http://localhost:3000";

const createRequestBody = {
  name: "Sample Project",
  description: "This is a sample project description.",
  cluster: "SILVER", // Assuming CLUSTER_A is a valid enum value for Cluster
  ministry: "AGRI", // Assuming AGRI is a valid enum value for Ministry
  projectOwner: {
    firstName: "John",
    lastName: "Doe",
    email: "oamar.kanji@gov.bc.ca",
    ministry: "AGRI", // Assuming AGRI is a valid enum value for Ministry
  },
  primaryTechnicalLead: {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    ministry: "AGRI", // Assuming AGRI is a valid enum value for Ministry
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
    other: "Some other services",
    noServices: false,
  },
};

const quota = {
  cpu: DefaultCpuOptions.CPU_REQUEST_0_5_LIMIT_1_5,
  memory: DefaultMemoryOptions.MEMORY_REQUEST_2_LIMIT_4,
  storage: DefaultStorageOptions.STORAGE_1,
};

const adminChanges = {
  name: "New name from admin",
  description: "New description from admin",
  projectOwner: {
    firstName: "James",
    lastName: "Tim",
    email: "jamestim@gov.bc.ca",
    ministry: "AGRI",
  },
  testQuota: {
    cpu: "CPU_REQUEST_8_LIMIT_16",
    memory: "MEMORY_REQUEST_4_LIMIT_8",
    storage: "STORAGE_2",
  },
};

const decisionBody = {
  decision: "APPROVED",
  humanComment: "Approved by admin",
  ...createRequestBody,
  productionQuota: quota,
  toolsQuota: quota,
  developmentQuota: quota,
  ...adminChanges,
};

const adminRequestedProjectBody = { ...createRequestBody, ...adminChanges };

const mockedGetServerSession = getServerSession as unknown as MockedFunction<
  typeof getServerSession
>;

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("next-auth", () => ({
  default: jest.fn(), // for default export
  NextAuth: jest.fn(), // for named export
}));

jest.mock("../../../auth/[...nextauth]/route", () => ({
  GET: jest.fn(),
  POST: jest.fn(),
}));

describe("Create Private Cloud Request Route", () => {
  let createRequestId: string;
  let API_URL: string;

  beforeAll(async () => {
    // await cleanUp();

    mockedGetServerSession.mockResolvedValue({
      user: {
        email: "oamar.kanji@gov.bc.ca",
        roles: [],
      },
    });

    const req = new NextRequest(`${BASE_URL}/api/create/private-cloud`, {
      method: "POST",
      body: JSON.stringify(createRequestBody),
    });

    await createRequest(req);
    const privateCloudRequests = await prisma.privateCloudRequest.findMany();

    const request = await prisma.privateCloudRequest.findFirst();

    if (!request) {
      throw new Error("Request not created. Issue in beforeAll");
    }

    createRequestId = request?.id;
    API_URL = `${BASE_URL}/api/decision/private-cloud/${createRequestId}`;
  });

  afterAll(async () => {
    // await cleanUp();
  });

  test("should return 401 if user is not authenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const req = new NextRequest(API_URL, {
      method: "POST",
      body: JSON.stringify({
        decision: "APPROVED",
        humanComment: "Approved by admin",
        ...adminRequestedProjectBody,
      }),
    });

    const response = await POST(req, { params: { id: createRequestId } });
    expect(response.status).toBe(401);
  });

  test("should return 403 if not an admin", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: {
        email: "oamar.kanji@gov.bc.ca",
        roles: [],
      },
    });

    const req = new NextRequest(API_URL, {
      method: "POST",
      body: JSON.stringify(createRequestBody),
    });

    const response = await POST(req, { params: { id: createRequestId } });
    expect(response.status).toBe(403);
  });

  test("should return 200 if decision request is successful", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: {
        email: "oamar.kanji@gov.bc.ca",
        roles: ["admin"],
      },
    });

    const req = new NextRequest(API_URL, {
      method: "POST",
      body: JSON.stringify(decisionBody),
    });

    const response = await POST(req, { params: { id: createRequestId } });
    expect(response.status).toBe(200);
  });

  // test("should create a request with the correct data in requestedProject", async () => {
  //   const requests = await prisma.privateCloudRequest.findMany();

  //   const request = requests[0];

  //   const requestedProject =
  //     await prisma.privateCloudRequestedProject.findUnique({
  //       where: {
  //         id: request.requestedProjectId,
  //       },
  //       include: {
  //         projectOwner: true,
  //         primaryTechnicalLead: true,
  //         secondaryTechnicalLead: true,
  //       },
  //     });

  //   if (!requestedProject) {
  //     throw new Error("Requested project not found.");
  //   }

  //   expect(requestedProject.name).toBe(createRequestBody.name);
  //   expect(requestedProject.description).toBe(createRequestBody.description);
  //   expect(requestedProject.cluster).toBe(createRequestBody.cluster);
  //   expect(requestedProject.ministry).toBe(createRequestBody.ministry);
  //   expect(requestedProject.projectOwner.firstName).toBe(
  //     createRequestBody.projectOwner.firstName
  //   );
  //   expect(requestedProject.projectOwner.lastName).toBe(
  //     createRequestBody.projectOwner.lastName
  //   );
  //   expect(requestedProject.projectOwner.email).toBe(
  //     createRequestBody.projectOwner.email
  //   );
  //   expect(requestedProject.projectOwner.ministry).toBe(
  //     createRequestBody.projectOwner.ministry
  //   );
  //   expect(requestedProject.primaryTechnicalLead.firstName).toBe(
  //     createRequestBody.primaryTechnicalLead.firstName
  //   );
  //   expect(requestedProject.primaryTechnicalLead.lastName).toBe(
  //     createRequestBody.primaryTechnicalLead.lastName
  //   );
  //   expect(requestedProject.primaryTechnicalLead.email).toBe(
  //     createRequestBody.primaryTechnicalLead.email
  //   );
  //   expect(requestedProject.primaryTechnicalLead.ministry).toBe(
  //     createRequestBody.primaryTechnicalLead.ministry
  //   );
  //   expect(requestedProject.secondaryTechnicalLead).toBeNull();
  //   expect(
  //     requestedProject.commonComponents.addressAndGeolocation.planningToUse
  //   ).toBe(
  //     createRequestBody.commonComponents.addressAndGeolocation.planningToUse
  //   );
  //   expect(
  //     requestedProject.commonComponents.addressAndGeolocation.implemented
  //   ).toBe(
  //     createRequestBody.commonComponents.addressAndGeolocation.implemented
  //   );
  //   expect(
  //     requestedProject.commonComponents.workflowManagement.planningToUse
  //   ).toBe(createRequestBody.commonComponents.workflowManagement.planningToUse);
  //   expect(
  //     requestedProject.commonComponents.workflowManagement.implemented
  //   ).toBe(createRequestBody.commonComponents.workflowManagement.implemented);
  //   expect(
  //     requestedProject.commonComponents.formDesignAndSubmission.planningToUse
  //   ).toBe(
  //     createRequestBody.commonComponents.formDesignAndSubmission.planningToUse
  //   );
  //   expect(
  //     requestedProject.commonComponents.formDesignAndSubmission.implemented
  //   ).toBe(
  //     createRequestBody.commonComponents.formDesignAndSubmission.implemented
  //   );
  //   expect(
  //     requestedProject.commonComponents.identityManagement.planningToUse
  //   ).toBe(createRequestBody.commonComponents.identityManagement.planningToUse);
  //   expect(
  //     requestedProject.commonComponents.identityManagement.implemented
  //   ).toBe(createRequestBody.commonComponents.identityManagement.implemented);
  //   expect(
  //     requestedProject.commonComponents.paymentServices.planningToUse
  //   ).toBe(createRequestBody.commonComponents.paymentServices.planningToUse);
  //   expect(requestedProject.commonComponents.paymentServices.implemented).toBe(
  //     createRequestBody.commonComponents.paymentServices.implemented
  //   );
  //   expect(
  //     requestedProject.commonComponents.documentManagement.planningToUse
  //   ).toBe(createRequestBody.commonComponents.documentManagement.planningToUse);
  //   expect(
  //     requestedProject.commonComponents.documentManagement.implemented
  //   ).toBe(createRequestBody.commonComponents.documentManagement.implemented);
  //   expect(
  //     requestedProject.commonComponents.endUserNotificationAndSubscription
  //       .planningToUse
  //   ).toBe(
  //     createRequestBody.commonComponents.endUserNotificationAndSubscription
  //       .planningToUse
  //   );
  //   expect(
  //     requestedProject.commonComponents.endUserNotificationAndSubscription
  //       .implemented
  //   ).toBe(
  //     createRequestBody.commonComponents.endUserNotificationAndSubscription
  //       .implemented
  //   );
  //   expect(requestedProject.commonComponents.publishing.planningToUse).toBe(
  //     createRequestBody.commonComponents.publishing.planningToUse
  //   );
  //   expect(requestedProject.commonComponents.publishing.implemented).toBe(
  //     createRequestBody.commonComponents.publishing.implemented
  //   );
  //   expect(
  //     requestedProject.commonComponents.businessIntelligence.planningToUse
  //   ).toBe(
  //     createRequestBody.commonComponents.businessIntelligence.planningToUse
  //   );
  //   expect(
  //     requestedProject.commonComponents.businessIntelligence.implemented
  //   ).toBe(createRequestBody.commonComponents.businessIntelligence.implemented);
  //   expect(requestedProject.commonComponents.other).toBe(
  //     createRequestBody.commonComponents.other
  //   );
  //   expect(requestedProject.commonComponents.noServices).toBe(
  //     createRequestBody.commonComponents.noServices
  //   );
  // });

  // test("should create a request with the correct data in adminRequestedProject", async () => {
  //   const requests = await prisma.privateCloudRequest.findMany();

  //   const request = requests[0];

  //   const adminRequestedProject =
  //     await prisma.privateCloudRequestedProject.findUnique({
  //       where: {
  //         id: request.adminRequestedProjectId || undefined,
  //       },
  //       include: {
  //         projectOwner: true,
  //         primaryTechnicalLead: true,
  //         secondaryTechnicalLead: true,
  //       },
  //     });

  //   if (!adminRequestedProject) {
  //     throw new Error("Requested project not found.");
  //   }

  //   expect(adminRequestedProject.name).toBe(createRequestBody.name);
  //   expect(adminRequestedProject.description).toBe(
  //     createRequestBody.description
  //   );
  //   expect(adminRequestedProject.cluster).toBe(createRequestBody.cluster);
  //   expect(adminRequestedProject.ministry).toBe(createRequestBody.ministry);
  //   expect(adminRequestedProject.projectOwner.firstName).toBe(
  //     createRequestBody.projectOwner.firstName
  //   );
  //   expect(adminRequestedProject.projectOwner.lastName).toBe(
  //     createRequestBody.projectOwner.lastName
  //   );
  //   expect(adminRequestedProject.projectOwner.email).toBe(
  //     createRequestBody.projectOwner.email
  //   );
  //   expect(adminRequestedProject.projectOwner.ministry).toBe(
  //     createRequestBody.projectOwner.ministry
  //   );
  //   expect(adminRequestedProject.primaryTechnicalLead.firstName).toBe(
  //     createRequestBody.primaryTechnicalLead.firstName
  //   );
  //   expect(adminRequestedProject.primaryTechnicalLead.lastName).toBe(
  //     createRequestBody.primaryTechnicalLead.lastName
  //   );
  //   expect(adminRequestedProject.primaryTechnicalLead.email).toBe(
  //     createRequestBody.primaryTechnicalLead.email
  //   );
  //   expect(adminRequestedProject.primaryTechnicalLead.ministry).toBe(
  //     createRequestBody.primaryTechnicalLead.ministry
  //   );
  //   expect(adminRequestedProject.secondaryTechnicalLead).toBeNull();
  //   expect(
  //     adminRequestedProject.commonComponents.addressAndGeolocation.planningToUse
  //   ).toBe(
  //     createRequestBody.commonComponents.addressAndGeolocation.planningToUse
  //   );
  //   expect(
  //     adminRequestedProject.commonComponents.addressAndGeolocation.implemented
  //   ).toBe(
  //     createRequestBody.commonComponents.addressAndGeolocation.implemented
  //   );
  //   expect(
  //     adminRequestedProject.commonComponents.workflowManagement.planningToUse
  //   ).toBe(createRequestBody.commonComponents.workflowManagement.planningToUse);
  //   expect(
  //     adminRequestedProject.commonComponents.workflowManagement.implemented
  //   ).toBe(createRequestBody.commonComponents.workflowManagement.implemented);
  //   expect(
  //     adminRequestedProject.commonComponents.formDesignAndSubmission
  //       .planningToUse
  //   ).toBe(
  //     createRequestBody.commonComponents.formDesignAndSubmission.planningToUse
  //   );
  //   expect(
  //     adminRequestedProject.commonComponents.formDesignAndSubmission.implemented
  //   ).toBe(
  //     createRequestBody.commonComponents.formDesignAndSubmission.implemented
  //   );
  //   expect(
  //     adminRequestedProject.commonComponents.identityManagement.planningToUse
  //   ).toBe(createRequestBody.commonComponents.identityManagement.planningToUse);
  //   expect(
  //     adminRequestedProject.commonComponents.identityManagement.implemented
  //   ).toBe(createRequestBody.commonComponents.identityManagement.implemented);
  //   expect(
  //     adminRequestedProject.commonComponents.paymentServices.planningToUse
  //   ).toBe(createRequestBody.commonComponents.paymentServices.planningToUse);
  //   expect(
  //     adminRequestedProject.commonComponents.paymentServices.implemented
  //   ).toBe(createRequestBody.commonComponents.paymentServices.implemented);
  //   expect(
  //     adminRequestedProject.commonComponents.documentManagement.planningToUse
  //   ).toBe(createRequestBody.commonComponents.documentManagement.planningToUse);
  //   expect(
  //     adminRequestedProject.commonComponents.documentManagement.implemented
  //   ).toBe(createRequestBody.commonComponents.documentManagement.implemented);
  //   expect(
  //     adminRequestedProject.commonComponents.endUserNotificationAndSubscription
  //       .planningToUse
  //   ).toBe(
  //     createRequestBody.commonComponents.endUserNotificationAndSubscription
  //       .planningToUse
  //   );
  //   expect(
  //     adminRequestedProject.commonComponents.endUserNotificationAndSubscription
  //       .implemented
  //   ).toBe(
  //     createRequestBody.commonComponents.endUserNotificationAndSubscription
  //       .implemented
  //   );
  //   expect(
  //     adminRequestedProject.commonComponents.publishing.planningToUse
  //   ).toBe(createRequestBody.commonComponents.publishing.planningToUse);
  //   expect(adminRequestedProject.commonComponents.publishing.implemented).toBe(
  //     createRequestBody.commonComponents.publishing.implemented
  //   );
  //   expect(
  //     adminRequestedProject.commonComponents.businessIntelligence.planningToUse
  //   ).toBe(
  //     createRequestBody.commonComponents.businessIntelligence.planningToUse
  //   );
  //   expect(
  //     adminRequestedProject.commonComponents.businessIntelligence.implemented
  //   ).toBe(createRequestBody.commonComponents.businessIntelligence.implemented);
  //   expect(adminRequestedProject.commonComponents.other).toBe(
  //     createRequestBody.commonComponents.other
  //   );
  //   expect(adminRequestedProject.commonComponents.noServices).toBe(
  //     createRequestBody.commonComponents.noServices
  //   );
  // });
});
