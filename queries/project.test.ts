import { privateCloudProjectsPaginated } from "@/queries/project";
import prisma from "@/lib/prisma";
import {
  Prisma,
  ProjectStatus,
  DefaultCpuOptions,
  DefaultMemoryOptions,
  DefaultStorageOptions,
  PrivateCloudProject,
  Ministry,
  Cluster,
} from "@prisma/client";
// import { cleanUp } from "@/jest.setup";

const quota = {
  cpu: DefaultCpuOptions.CPU_REQUEST_0_5_LIMIT_1_5,
  memory: DefaultMemoryOptions.MEMORY_REQUEST_2_LIMIT_4,
  storage: DefaultStorageOptions.STORAGE_1,
};

const projectData = {
  name: "Sample Project",
  description: "This is a sample project description.",
  cluster: Cluster.SILVER, // Assuming CLUSTER_A is a valid enum value for Cluster
  ministry: Ministry.AG, // Assuming AGRI is a valid enum value for Ministry
  projectOwner: {
    firstName: "Oamar",
    lastName: "Kanji",
    email: "oamar.kanji@gov.bc.ca",
    ministry: Ministry.AG, // Assuming AGRI is a valid enum value for Ministry
  },
  primaryTechnicalLead: {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    ministry: Ministry.AG, // Assuming AGRI is a valid enum value for Ministry
  },
  secondaryTechnicalLead: {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    ministry: Ministry.AG, // Assuming AGRI is a valid enum value for Ministry
  },
  productionQuota: quota,
  testQuota: quota,
  toolsQuota: quota,
  developmentQuota: quota,
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

const createProject = {
  name: projectData.name,
  description: projectData.description,
  cluster: projectData.cluster, // Assuming CLUSTER_A is a valid enum value for Cluster
  ministry: projectData.ministry, // Assuming AGRI is a valid enum value for Ministry
  status: ProjectStatus.ACTIVE,
  licencePlate: "654321",
  productionQuota: quota,
  testQuota: quota,
  toolsQuota: quota,
  developmentQuota: quota,
  projectOwner: {
    connectOrCreate: {
      where: {
        email: projectData.projectOwner.email,
      },
      create: projectData.projectOwner,
    },
  },
  primaryTechnicalLead: {
    connectOrCreate: {
      where: {
        email: projectData.primaryTechnicalLead.email,
      },
      create: projectData.primaryTechnicalLead,
    },
  },
  secondaryTechnicalLead: {
    connectOrCreate: {
      where: {
        email: projectData.secondaryTechnicalLead.email,
      },
      create: projectData.secondaryTechnicalLead,
    },
  },
  commonComponents: projectData.commonComponents,
};

describe("Query projects with filter and search and pagination", () => {
  beforeAll(async () => {
    // Create 10 more projects without secondary technical lead
    for (let i = 0; i < 5; i++) {
      await prisma.privateCloudProject.create({
        data: {
          ...createProject,
          name: createProject.name + i,
          licencePlate: "123456" + i,
          secondaryTechnicalLead: undefined,
        },
      });
    }
  });

  test("Should return all projects even though there is no secondary technical lead", async () => {
    const projects = await privateCloudProjectsPaginated(5, 1);

    expect(projects.data.length).toBe(5);
  });

  test("Should return all projects with secondary technical lead", async () => {
    // Create 10 more projects with secondary technical lead
    for (let i = 5; i < 10; i++) {
      await prisma.privateCloudProject.create({
        data: {
          ...createProject,
          name: createProject.name + i,
          licencePlate: "123456" + i,
        },
      });
    }

    const projects = await privateCloudProjectsPaginated(10, 1);

    expect(projects.data.length).toBe(10);
  });

  test("Should return only projects belonging to specific user when userEmail is passed", async () => {
    // Create 10 more projects with a different email
    for (let i = 10; i < 15; i++) {
      await prisma.privateCloudRequestedProject.create({
        data: {
          ...createProject,
          name: createProject.name + i,
          licencePlate: "123456" + i,
          primaryTechnicalLead: {
            connectOrCreate: {
              where: {
                email: "testUser@test.com",
              },
              create: {
                firstName: "Test",
                lastName: "User",
                email: "testUser@test.com",
                ministry: Ministry.CITZ,
              },
            },
          },
        },
      });
    }

    // await prisma.privateCloudRequestedProject.create({
    //   data: {
    //     User:{
    //       name: {}
    //     }
    //   },
    // });

    // const allProjects = await privateCloudProjectsPaginated(30, 1);
    // expect(
    //   allProjects.data.some(
    //     (project) =>
    //       project.primaryTechnicalLeadDetails.email === "testUser@test.com"
    //   )
    // ).toBe(true);

    const projects = await privateCloudProjectsPaginated(
      15,
      1,
      // undefined,
      // undefined,
      // undefined,
      // "oamar.kanji@gov.bc.ca",
    );

    console.log(projects)

    expect(projects.total).toBe(5);
  });
});
