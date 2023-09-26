import { prisma } from "@/jest.setup";
import { getServerSession } from "next-auth/next";
import NextAuth from "next-auth";
import { POST } from "@/app/api/requests/private-cloud/create/route";
import { MockedFunction } from "jest-mock";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://localhost:3000";
const API_URL = `${BASE_URL}/api/requests/private-cloud/create`;

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
  beforeAll(async () => {
    await prisma.privateCloudRequest.deleteMany();
  });

  test("should return 200 if request is created", async () => {
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

    const response = await POST(req);
    expect(response.status).toBe(200);
  });

  // test to check if a request is created in the database
  test("should create a request in the database", async () => {
    const requests = await prisma.privateCloudRequest.findMany();
    console.log(requests);
    expect(requests.length).toBe(1);
  });
});
