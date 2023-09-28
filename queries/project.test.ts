import { privateCloudProjectsPaginated } from "@/queries/project";
import prisma from "@/lib/prisma";
import {
  Prisma,
  ProjectStatus,
  DefaultCpuOptions,
  DefaultMemoryOptions,
  DefaultStorageOptions,
  PrivateCloudProjectPayload
} from "@prisma/client";

const quota = {
  cpu: DefaultCpuOptions.CPU_REQUEST_0_5_LIMIT_1_5,
  memory: DefaultMemoryOptions.MEMORY_REQUEST_2_LIMIT_4,
  storage: DefaultStorageOptions.STORAGE_1
};

const createProject: PrivateCloudProjectPayload = {
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
  productionQuota: quota,
  testQuota: quota,
  toolsQuota: quota,
  developmentQuota: quota,
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

const test = {
  create: {
    name: "Sample Project",
    description: "This is a sample project description.",
    cluster: "SILVER", // Assuming CLUSTER_A is a valid enum value for Cluster
    ministry: "AGRI", // Assuming AGRI is a valid enum value for Ministry
    status: ProjectStatus.ACTIVE,
    licencePlate: "123456",
    productionQuota: defaultQuota,
    testQuota: defaultQuota,
    toolsQuota: defaultQuota,
    developmentQuota: defaultQuota,
    projectOwner: {
      connectOrCreate: {
        where: {
          email: formData.projectOwner.email
        },
        create: formData.projectOwner
      }
    },
    primaryTechnicalLead: {
      connectOrCreate: {
        where: {
          email: formData.primaryTechnicalLead.email
        },
        create: formData.primaryTechnicalLead
      }
    },
    secondaryTechnicalLead: formData.secondaryTechnicalLead
      ? {
          connectOrCreate: {
            where: {
              email: formData.secondaryTechnicalLead.email
            },
            create: formData.secondaryTechnicalLead
          }
        }
      : undefined
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

describe("Query projects with filter and search and pagination", () => {
  beforeAll(async () => {});

  test("Should return all projects", async () => {
    expect("").toBe("");
  });
});
