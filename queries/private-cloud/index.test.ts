import {
  privateCloudProjects,
  privateCloudRequests,
} from "@/queries/private-cloud";
import prisma from "@/lib/prisma";
import {
  Prisma,
  RequestType,
  DecisionStatus,
  ProjectStatus,
  PrivateCloudProject,
  Ministry,
  Cluster,
  User,
} from "@prisma/client";
import {
  DefaultCpuOptionsSchema,
  DefaultMemoryOptionsSchema,
  DefaultStorageOptionsSchema,
} from "@/schema";
// import { cleanUp } from "@/jest.setup";

const quota = {
  cpu: DefaultCpuOptionsSchema.enum.CPU_REQUEST_0_5_LIMIT_1_5,
  memory: DefaultMemoryOptionsSchema.enum.MEMORY_REQUEST_2_LIMIT_4,
  storage: DefaultStorageOptionsSchema.enum.STORAGE_1,
};

const projectData = {
  name: "Sample Project",
  description: "This is a sample project description.",
  cluster: Cluster.CLAB, // Assuming CLUSTER_A is a valid enum value for Cluster
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

const projectData2 = {
  name: "Project",
  description: "This is a sample project description.",
  cluster: Cluster.SILVER, // Assuming CLUSTER_A is a valid enum value for Cluster
  ministry: Ministry.AG, // Assuming AGRI is a valid enum value for Ministry
  projectOwner: {
    firstName: "Christopher",
    lastName: "Tan",
    email: "christopher.tan@gov.bc.ca",
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

function createProjectObject(data: any) {
  const createProject = {
    name: data.name,
    description: data.description,
    cluster: data.cluster, // Assuming CLUSTER_A is a valid enum value for Cluster
    ministry: data.ministry, // Assuming AGRI is a valid enum value for Ministry
    status: ProjectStatus.ACTIVE,
    licencePlate: "654321",
    productionQuota: quota,
    testQuota: quota,
    toolsQuota: quota,
    developmentQuota: quota,
    projectOwner: {
      connectOrCreate: {
        where: {
          email: data.projectOwner.email,
        },
        create: data.projectOwner,
      },
    },
    primaryTechnicalLead: {
      connectOrCreate: {
        where: {
          email: data.primaryTechnicalLead.email,
        },
        create: data.primaryTechnicalLead,
      },
    },
    secondaryTechnicalLead: {
      connectOrCreate: {
        where: {
          email: data.secondaryTechnicalLead.email,
        },
        create: data.secondaryTechnicalLead,
      },
    },
    commonComponents: data.commonComponents,
  };
  return createProject;
}

const projectObject = createProjectObject(projectData);
const projectObject2 = createProjectObject(projectData2);

describe("Query projects with filter and search", () => {
  const seededProjectsCount = 5;

  beforeAll(async () => {
    // Seed the database with 5 projects
    for (let i = 0; i < seededProjectsCount; i++) {
      await prisma.privateCloudProject.create({
        data: {
          ...projectObject,
          name: projectObject.name + i,
          licencePlate: "123456" + i,
          secondaryTechnicalLead: undefined,
        },
      });
    }
  });

  afterAll(async () => {
    // Cleanup the database by removing the seeded projects
    for (let i = 0; i < seededProjectsCount; i++) {
      const projectToDelete = await prisma.privateCloudProject.findFirst({
        where: { name: projectObject.name + i }
      });
      if (projectToDelete) {
        await prisma.privateCloudProject.delete({
          where: { id: projectToDelete.id }
        });
      }
    }
  });

  test("Should return all projects ", async () => {
    const projects = await privateCloudProjects();
    expect(projects.length).toBe(5);
  });

  test("Should return only projects that fits the SearchTerm", async () => {
    const projects = await privateCloudProjects("Sample Project1");
    expect(projects.length).toBe(1);
  });

  test("Should return no projects for a search tearm non included in any projects", async () => {
    const projects = await privateCloudProjects("abcdefg");
    expect(projects.length).toBe(0);
  });


  test("Should return all projects", async () => {
    const projects = await privateCloudProjects();
    expect(projects.length).toBe(seededProjectsCount);
  });

  test("Should return limited number of projects", async () => {
    const projects = await privateCloudProjects(undefined, undefined, undefined, undefined, 5); // assuming the 5th parameter is limit
    expect(projects.length).toBe(5);
  });

  test("Should paginate projects correctly", async () => {
    const page1 = await privateCloudProjects(undefined, undefined, undefined, undefined, 5, 0); // 5 projects from the start
    const page2 = await privateCloudProjects(undefined, undefined, undefined, undefined, 5, 5); // next 5 projects
    expect(page1[4].name).not.toBe(page2[0].name); // last project of page 1 should not be the first project of page 2
  });
  
  


});


  //   test("Should return only projects belonging to specific user when userEmail is passed", async () => {
  //     // Create 3 more projects with secondary technical lead, and different project lead
  //     for (let i = 5; i < 8; i++) {
  //       await prisma.privateCloudRequest.create({
  //         data: {
  //           type: RequestType.CREATE,
  //           decisionStatus: DecisionStatus.PENDING,
  //           active: true,
  //           createdByEmail: projectData2.projectOwner.email,
  //           licencePlate: "123456" + i,
  //           requestedProject: {
  //             create: createProjectObject(projectData2),
  //           },
  //           userRequestedProject: {
  //             create: createProjectObject(projectData2),
  //           },
  //         },
  //         include: {
  //           requestedProject: {
  //             include: {
  //               projectOwner: true,
  //               primaryTechnicalLead: true,
  //               secondaryTechnicalLead: true,
  //             },
  //           },
  //         },
  //       });
  //     }

  //     const projects = await privateCloudProjects(
  //       undefined,
  //       undefined,
  //       undefined,
  //       "christopher.tan@gov.bc.ca"
  //     );
  //     expect(projects.total).toBe(3);
  //   });

  //   test("Should return all projects with secondary technical lead", async () => {
  //     // Create 3 more projects with secondary technical lead, and different project lead
  //     for (let i = 5; i < 8; i++) {
  //       await prisma.privateCloudProject.create({
  //         data: {
  //           ...projectObject2,
  //           name: projectData2.name + i,
  //           licencePlate: "123456" + i,
  //         },
  //       });
  //     }

  //     const projects = await privateCloudProjects(
  //       undefined,
  //       undefined,
  //       undefined,
  //       "christopher.tan@gov.bc.ca"
  //     );

  //     expect(projects.data.length).toBe(3);
  //   });

  //   test("Should return only projects that fits the SearchTerm", async () => {
  //     const projects = await privateCloudProjects("sample");
  //     //projects searches for description, unlike requests
  //     expect(projects.total).toBe(8);
  //   });

  //   test("Should return only projects that fits the SearchTerm", async () => {
  //     const projects = await privateCloudProjects(undefined, undefined, "CLAB");

  //     expect(projects.total).toBe(5);
  //   });
  //