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
  ministry: "CITZ", // Assuming MINISTRY_X is a valid enum value for Ministry
  projectOwner: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    ministry: "CITZ", // Assuming MINISTRY_X is a valid enum value for Ministry
  },
  primaryTechnicalLead: {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    ministry: "CITZ", // Assuming MINISTRY_Y is a valid enum value for Ministry
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
      implemented: false,
    },
    identityManagement: {
      planningToUse: true,
      implemented: false,
    },
    paymentServices: {
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

    console.log(await response.json());

    expect(response.status).toBe(400);
  });
});
