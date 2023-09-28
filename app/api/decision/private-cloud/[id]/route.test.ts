import { prisma } from "@/jest.setup";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import NextAuth from "next-auth";
import { POST as createRequest } from "@/app/api/create/private-cloud/route";
import { POST } from "@/app/api/decision/private-cloud/[id]/route";
import { MockedFunction } from "jest-mock";
import { NextRequest, NextResponse } from "next/server";

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
    ministry: "AGRI" // Assuming AGRI is a valid enum value for Ministry
  },
  primaryTechnicalLead: {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    ministry: "AGRI" // Assuming AGRI is a valid enum value for Ministry
  },
  commonComponents: {
    addressAndGeolocation: {
      planningToUse: true,
      implemented: false
    },
    workflowManagement: {
      planningToUse: false,
      implemented: true
    },
    formDesignAndSubmission: {
      planningToUse: true,
      implemented: true
    },
    identityManagement: {
      planningToUse: false,
      implemented: false
    },
    paymentServices: {
      planningToUse: true,
      implemented: false
    },
    documentManagement: {
      planningToUse: false,
      implemented: true
    },
    endUserNotificationAndSubscription: {
      planningToUse: true,
      implemented: false
    },
    publishing: {
      planningToUse: false,
      implemented: true
    },
    businessIntelligence: {
      planningToUse: true,
      implemented: false
    },
    other: "Some other services",
    noServices: false
  }
};

const adminChanges = {
  name: "New name from admin",
  description: "New description from admin",
  projectOwner: {
    firstName: "James",
    lastName: "Tim",
    email: "jamestim@gov.bc.ca",
    ministry: "AGRI"
  },
  testQuota: {
    cpu: "CPU_REQUEST_8_LIMIT_16",
    memory: "MEMORY_REQUEST_4_LIMIT_8",
    storage: "STORAGE_2"
  }
};

const adminRequestedProject = { ...createRequestBody, ...adminChanges };

const mockedGetServerSession = getServerSession as unknown as MockedFunction<
  typeof getServerSession
>;

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn()
}));

jest.mock("next-auth", () => ({
  default: jest.fn(), // for default export
  NextAuth: jest.fn() // for named export
}));

jest.mock("../../../auth/[...nextauth]/route", () => ({
  GET: jest.fn(),
  POST: jest.fn()
}));

describe("Create Private Cloud Request Route", () => {
  let createRequestId: string;
  let API_URL: string;

  beforeAll(async () => {
    mockedGetServerSession.mockResolvedValue({
      user: {
        email: "oamar.kanji@gov.bc.ca",
        roles: []
      }
    });

    const req = new NextRequest(`${BASE_URL}/api/create/private-cloud`, {
      method: "POST",
      body: JSON.stringify(createRequestBody)
    });

    await createRequest(req);

    const request = await prisma.privateCloudRequest.findFirst();
    console.log(request);

    if (!request) {
      throw new Error("Request not created. Issue in beforeAll");
    }

    createRequestId = request?.id;
    API_URL = `${BASE_URL}/api/decision/private-cloud/${createRequestId}`;
  });

  test("should return 401 if user is not authenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const req = new NextRequest(API_URL, {
      method: "POST",
      body: JSON.stringify({
        decision: "APPROVED",
        humanComment: "Approved by admin",
        ...adminRequestedProject
      })
    });

    const response = await POST(req, { params: { id: createRequestId } });
    expect(response.status).toBe(401);
  });

  test("should return 403 if not an admin", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: {
        email: "oamar.kanji@gov.bc.ca",
        roles: []
      }
    });

    const req = new NextRequest(API_URL, {
      method: "POST",
      body: JSON.stringify(createRequestBody)
    });

    const response = await POST(req, { params: { id: createRequestId } });
    expect(response.status).toBe(403);
  });

  test("should return 200 if decision request is successful", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: {
        email: "oamar.kanji@gov.bc.ca",
        roles: ["admin"]
      }
    });

    const req = new NextRequest(API_URL, {
      method: "POST",
      body: JSON.stringify({
        decision: "APPROVED",
        humanComment: "Approved by admin",
        ...adminRequestedProject
      })
    });

    const response = await POST(req, { params: { id: createRequestId } });
    expect(response.status).toBe(200);
  });

  // test to check if the request created in the database has the correct data
  test("should create a request with the correct data", async () => {
    const requests = await prisma.privateCloudRequest.findMany();

    const request = requests[0];

    const requestedProject =
      await prisma.privateCloudRequestedProject.findUnique({
        where: {
          id: request.requestedProjectId
        },
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true
        }
      });

    if (!requestedProject) {
      throw new Error("Requested project not found.");
    }

    expect(requestedProject.name).toBe(adminRequestedProject.name);
    expect(requestedProject.description).toBe(
      adminRequestedProject.description
    );
    expect(requestedProject.cluster).toBe(adminRequestedProject.cluster);
    expect(requestedProject.ministry).toBe(adminRequestedProject.ministry);
    expect(requestedProject.projectOwner.firstName).toBe(
      adminRequestedProject.projectOwner.firstName
    );
    expect(requestedProject.projectOwner.lastName).toBe(
      adminRequestedProject.projectOwner.lastName
    );
    expect(requestedProject.projectOwner.email).toBe(
      adminRequestedProject.projectOwner.email
    );
    expect(requestedProject.projectOwner.ministry).toBe(
      adminRequestedProject.projectOwner.ministry
    );
    expect(requestedProject.primaryTechnicalLead.firstName).toBe(
      adminRequestedProject.primaryTechnicalLead.firstName
    );
    expect(requestedProject.primaryTechnicalLead.lastName).toBe(
      adminRequestedProject.primaryTechnicalLead.lastName
    );
    expect(requestedProject.primaryTechnicalLead.email).toBe(
      adminRequestedProject.primaryTechnicalLead.email
    );
    expect(requestedProject.primaryTechnicalLead.ministry).toBe(
      adminRequestedProject.primaryTechnicalLead.ministry
    );
    expect(requestedProject.secondaryTechnicalLead).toBeNull();
    expect(
      requestedProject.commonComponents.addressAndGeolocation.planningToUse
    ).toBe(
      adminRequestedProject.commonComponents.addressAndGeolocation.planningToUse
    );
    expect(
      requestedProject.commonComponents.addressAndGeolocation.implemented
    ).toBe(
      adminRequestedProject.commonComponents.addressAndGeolocation.implemented
    );
    expect(
      requestedProject.commonComponents.workflowManagement.planningToUse
    ).toBe(
      adminRequestedProject.commonComponents.workflowManagement.planningToUse
    );
    expect(
      requestedProject.commonComponents.workflowManagement.implemented
    ).toBe(
      adminRequestedProject.commonComponents.workflowManagement.implemented
    );
    expect(
      requestedProject.commonComponents.formDesignAndSubmission.planningToUse
    ).toBe(
      adminRequestedProject.commonComponents.formDesignAndSubmission
        .planningToUse
    );
    expect(
      requestedProject.commonComponents.formDesignAndSubmission.implemented
    ).toBe(
      adminRequestedProject.commonComponents.formDesignAndSubmission.implemented
    );
    expect(
      requestedProject.commonComponents.identityManagement.planningToUse
    ).toBe(
      adminRequestedProject.commonComponents.identityManagement.planningToUse
    );
    expect(
      requestedProject.commonComponents.identityManagement.implemented
    ).toBe(
      adminRequestedProject.commonComponents.identityManagement.implemented
    );
    expect(
      requestedProject.commonComponents.paymentServices.planningToUse
    ).toBe(
      adminRequestedProject.commonComponents.paymentServices.planningToUse
    );
    expect(requestedProject.commonComponents.paymentServices.implemented).toBe(
      adminRequestedProject.commonComponents.paymentServices.implemented
    );
    expect(
      requestedProject.commonComponents.documentManagement.planningToUse
    ).toBe(
      adminRequestedProject.commonComponents.documentManagement.planningToUse
    );
    expect(
      requestedProject.commonComponents.documentManagement.implemented
    ).toBe(
      adminRequestedProject.commonComponents.documentManagement.implemented
    );
    expect(
      requestedProject.commonComponents.endUserNotificationAndSubscription
        .planningToUse
    ).toBe(
      adminRequestedProject.commonComponents.endUserNotificationAndSubscription
        .planningToUse
    );
    expect(
      requestedProject.commonComponents.endUserNotificationAndSubscription
        .implemented
    ).toBe(
      adminRequestedProject.commonComponents.endUserNotificationAndSubscription
        .implemented
    );
    expect(requestedProject.commonComponents.publishing.planningToUse).toBe(
      adminRequestedProject.commonComponents.publishing.planningToUse
    );
    expect(requestedProject.commonComponents.publishing.implemented).toBe(
      adminRequestedProject.commonComponents.publishing.implemented
    );
    expect(
      requestedProject.commonComponents.businessIntelligence.planningToUse
    ).toBe(
      adminRequestedProject.commonComponents.businessIntelligence.planningToUse
    );
    expect(
      requestedProject.commonComponents.businessIntelligence.implemented
    ).toBe(
      adminRequestedProject.commonComponents.businessIntelligence.implemented
    );
    expect(requestedProject.commonComponents.other).toBe(
      adminRequestedProject.commonComponents.other
    );
    expect(requestedProject.commonComponents.noServices).toBe(
      adminRequestedProject.commonComponents.noServices
    );
  });
});
