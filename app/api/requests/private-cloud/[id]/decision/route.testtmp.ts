import { prisma } from "@/jest.setup";
import { getServerSession } from "next-auth/next";
import NextAuth from "next-auth";
import { POST } from "@/app/api/requests/private-cloud/create/route";
import { MockedFunction } from "jest-mock";
import { NextRequest, NextResponse } from "next/server";

const id = "123";

const BASE_URL = "http://localhost:3000";
const API_URL = `${BASE_URL}/api/requests/private-cloud/${id}/decision`;

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
  beforeAll(async () => {
    await prisma.privateCloudRequest.deleteMany();
  });

  // test to check if an error is thrown if the user is not authenticated
  test("should return 403 if user is not authenticated", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const req = new NextRequest(API_URL, {
      method: "POST",
      body: JSON.stringify(createRequestBody)
    });

    const response = await POST(req);
    expect(response.status).toBe(403);
  });

  test("should return 200 if request is created", async () => {
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

    const response = await POST(req);
    expect(response.status).toBe(200);
  });

  // test to check if a request is created in the database
  test("should create a request in the database", async () => {
    const requests = await prisma.privateCloudRequest.findMany();
    console.log(requests);
    expect(requests.length).toBe(1);
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

    expect(requestedProject.name).toBe(createRequestBody.name);
    expect(requestedProject.description).toBe(createRequestBody.description);
    expect(requestedProject.cluster).toBe(createRequestBody.cluster);
    expect(requestedProject.ministry).toBe(createRequestBody.ministry);
    expect(requestedProject.projectOwner.firstName).toBe(
      createRequestBody.projectOwner.firstName
    );
    expect(requestedProject.projectOwner.lastName).toBe(
      createRequestBody.projectOwner.lastName
    );
    expect(requestedProject.projectOwner.email).toBe(
      createRequestBody.projectOwner.email
    );
    expect(requestedProject.projectOwner.ministry).toBe(
      createRequestBody.projectOwner.ministry
    );
    expect(requestedProject.primaryTechnicalLead.firstName).toBe(
      createRequestBody.primaryTechnicalLead.firstName
    );
    expect(requestedProject.primaryTechnicalLead.lastName).toBe(
      createRequestBody.primaryTechnicalLead.lastName
    );
    expect(requestedProject.primaryTechnicalLead.email).toBe(
      createRequestBody.primaryTechnicalLead.email
    );
    expect(requestedProject.primaryTechnicalLead.ministry).toBe(
      createRequestBody.primaryTechnicalLead.ministry
    );
    expect(requestedProject.secondaryTechnicalLead).toBeNull();
    expect(
      requestedProject.commonComponents.addressAndGeolocation.planningToUse
    ).toBe(
      createRequestBody.commonComponents.addressAndGeolocation.planningToUse
    );
    expect(
      requestedProject.commonComponents.addressAndGeolocation.implemented
    ).toBe(
      createRequestBody.commonComponents.addressAndGeolocation.implemented
    );
    expect(
      requestedProject.commonComponents.workflowManagement.planningToUse
    ).toBe(createRequestBody.commonComponents.workflowManagement.planningToUse);
    expect(
      requestedProject.commonComponents.workflowManagement.implemented
    ).toBe(createRequestBody.commonComponents.workflowManagement.implemented);
    expect(
      requestedProject.commonComponents.formDesignAndSubmission.planningToUse
    ).toBe(
      createRequestBody.commonComponents.formDesignAndSubmission.planningToUse
    );
    expect(
      requestedProject.commonComponents.formDesignAndSubmission.implemented
    ).toBe(
      createRequestBody.commonComponents.formDesignAndSubmission.implemented
    );
    expect(
      requestedProject.commonComponents.identityManagement.planningToUse
    ).toBe(createRequestBody.commonComponents.identityManagement.planningToUse);
    expect(
      requestedProject.commonComponents.identityManagement.implemented
    ).toBe(createRequestBody.commonComponents.identityManagement.implemented);
    expect(
      requestedProject.commonComponents.paymentServices.planningToUse
    ).toBe(createRequestBody.commonComponents.paymentServices.planningToUse);
    expect(requestedProject.commonComponents.paymentServices.implemented).toBe(
      createRequestBody.commonComponents.paymentServices.implemented
    );
    expect(
      requestedProject.commonComponents.documentManagement.planningToUse
    ).toBe(createRequestBody.commonComponents.documentManagement.planningToUse);
    expect(
      requestedProject.commonComponents.documentManagement.implemented
    ).toBe(createRequestBody.commonComponents.documentManagement.implemented);
    expect(
      requestedProject.commonComponents.endUserNotificationAndSubscription
        .planningToUse
    ).toBe(
      createRequestBody.commonComponents.endUserNotificationAndSubscription
        .planningToUse
    );
    expect(
      requestedProject.commonComponents.endUserNotificationAndSubscription
        .implemented
    ).toBe(
      createRequestBody.commonComponents.endUserNotificationAndSubscription
        .implemented
    );
    expect(requestedProject.commonComponents.publishing.planningToUse).toBe(
      createRequestBody.commonComponents.publishing.planningToUse
    );
    expect(requestedProject.commonComponents.publishing.implemented).toBe(
      createRequestBody.commonComponents.publishing.implemented
    );
    expect(
      requestedProject.commonComponents.businessIntelligence.planningToUse
    ).toBe(
      createRequestBody.commonComponents.businessIntelligence.planningToUse
    );
    expect(
      requestedProject.commonComponents.businessIntelligence.implemented
    ).toBe(createRequestBody.commonComponents.businessIntelligence.implemented);
    expect(requestedProject.commonComponents.other).toBe(
      createRequestBody.commonComponents.other
    );
    expect(requestedProject.commonComponents.noServices).toBe(
      createRequestBody.commonComponents.noServices
    );
  });
});
