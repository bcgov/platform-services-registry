import { prisma } from "@/lib/prisma";
import {
  DefaultCpuOptions,
  DefaultMemoryOptions,
  DefaultStorageOptions,
} from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { POST as createRequest } from "@/app/api/create/private-cloud/route";
import { POST as decisionRequest } from "@/app/api/decision/private-cloud/[id]/route";
import { PUT } from "@/app/api/provision/private-cloud/[licencePlate]/route";
import { MockedFunction } from "jest-mock";
import { NextRequest, NextResponse } from "next/server";
import exp from "constants";

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
  let createRequestLicenceplate: string;
  let API_URL: string;

  beforeAll(async () => {
    // await cleanUp();

    mockedGetServerSession.mockResolvedValue({
      user: {
        email: "oamar.kanji@gov.bc.ca",
        roles: ["admin"],
      },
    });

    // Make a create request
    const createRequestObject = new NextRequest(
      `${BASE_URL}/api/create/private-cloud`,
      {
        method: "POST",
        body: JSON.stringify(createRequestBody),
      }
    );

    await createRequest(createRequestObject);

    // Get the request id
    const request = await prisma.privateCloudRequest.findFirst();

    if (!request) {
      throw new Error("Request not found for provision test.");
    }

    const createRequestId: string = request.id;
    createRequestLicenceplate = request.licencePlate;

    // Make a decision request
    const DECISION_API_URL = `${BASE_URL}/api/decision/private-cloud/${createRequestId}`;

    const decisionRequestObject = new NextRequest(DECISION_API_URL, {
      method: "POST",
      body: JSON.stringify(decisionBody),
    });

    await decisionRequest(decisionRequestObject, {
      params: { id: createRequestId },
    });

    // Create the proviiion request url
    API_URL = `${BASE_URL}/api/provision/private-cloud/${createRequestLicenceplate}`;
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
  //     params: { licencePlate: createRequestLicenceplate },
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
  //     params: { licencePlate: createRequestLicenceplate },
  //   });

  //   expect(response.status).toBe(403);
  // });

  test("should return 200 if provision is successful", async () => {
    // mockedGetServerSession.mockResolvedValue({
    //   user: {
    //     email: "oamar.kanji@gov.bc.ca",
    //     roles: ["admin"],
    //   },
    // });
    const req = new NextRequest(API_URL, {
      method: "PUT",
    });

    const response = await PUT(req, {
      params: { licencePlate: createRequestLicenceplate },
    });
    expect(response.status).toBe(200);
  });

  test("should be a project in the db", async () => {
    const project = await prisma.privateCloudProject.findFirst({
      where: { licencePlate: createRequestLicenceplate },
      include: {
        projectOwner: true,
        primaryTechnicalLead: true,
        secondaryTechnicalLead: true,
      },
    });

    if (!project) {
      throw new Error("Project not found in db");
    }

    expect(project).toBeTruthy();
    expect(project.licencePlate).toBe(createRequestLicenceplate);
    expect(project.name).toBe(decisionBody.name);
    expect(project.description).toBe(decisionBody.description);
    expect(project.cluster).toBe(decisionBody.cluster);
    expect(project.ministry).toBe(decisionBody.ministry);
    expect(project.projectOwner.email).toBe(decisionBody.projectOwner.email);
    expect(project.primaryTechnicalLead.email).toBe(
      decisionBody.primaryTechnicalLead.email
    );
    expect(project.secondaryTechnicalLead).toBe(null);
    expect(project.commonComponents).toBeTruthy();
    expect(project.testQuota).toStrictEqual(decisionBody.testQuota);
    expect(project.productionQuota).toStrictEqual(decisionBody.productionQuota);
    expect(project.toolsQuota).toStrictEqual(decisionBody.toolsQuota);
    expect(project.developmentQuota).toStrictEqual(
      decisionBody.developmentQuota
    );
  });

  test("the request should be marked as provisioned and not be active", async () => {
    const request = await prisma.privateCloudRequest.findFirst({
      where: { licencePlate: createRequestLicenceplate },
    });

    if (!request) {
      throw new Error("Request not found in db");
    }

    expect(request.decisionStatus).toBe("PROVISIONED");
    expect(request.active).toBe(false);
  });
});
