<<<<<<< HEAD
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
=======
import { 
  privateCloudProjectsPaginated, 
  privateCloudRequestsPaginated 
} from "@/queries/project";
import prisma from "@/lib/prisma";
import {
  Prisma,
  RequestType,
  DecisionStatus,
  ProjectStatus,
  PrivateCloudProject,
  Ministry,
  Cluster,
  User
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
>>>>>>> main
};

const projectData = {
  name: "Sample Project",
  description: "This is a sample project description.",
<<<<<<< HEAD
  cluster: Cluster.SILVER, // Assuming CLUSTER_A is a valid enum value for Cluster
=======
  cluster: Cluster.CLAB, // Assuming CLUSTER_A is a valid enum value for Cluster
>>>>>>> main
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

<<<<<<< HEAD
const createProject = {
  name: projectData.name,
  description: projectData.description,
  cluster: projectData.cluster, // Assuming CLUSTER_A is a valid enum value for Cluster
  ministry: projectData.ministry, // Assuming AGRI is a valid enum value for Ministry
  status: ProjectStatus.ACTIVE,
  licencePlate: "654321",
=======
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
>>>>>>> main
  productionQuota: quota,
  testQuota: quota,
  toolsQuota: quota,
  developmentQuota: quota,
<<<<<<< HEAD
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
    for (let i = 0; i < 10; i++) {
      await prisma.privateCloudProject.create({
        data: {
          ...createProject,
          name: createProject.name + i,
=======
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

function createProjectObject(data: any){
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

const projectObject = createProjectObject(projectData)
const projectObject2 = createProjectObject(projectData2)

describe("Query projects with filter and search and pagination", () => {
  beforeAll(async () => {

    for (let i = 0; i < 5; i++) {
      // Create 5 requests without secondary technical lead
      await prisma.privateCloudRequest.create({
        data: {
          type: RequestType.CREATE,
          decisionStatus: DecisionStatus.PENDING,
          active: true,
          createdByEmail: projectData.projectOwner.email,
          licencePlate: "123456" + i,
          requestedProject: {
            create: projectObject
          },
          userRequestedProject: {
            create: projectObject,
          },
        },
        include: {
          requestedProject: {
            include: {
              projectOwner: true,
              primaryTechnicalLead: true,
            },
          },
        },
      });

      // create 5 projects without secondary technical lead
      await prisma.privateCloudProject.create({
        data: {
          ...projectObject,
          name: projectObject.name + i,
>>>>>>> main
          licencePlate: "123456" + i,
          secondaryTechnicalLead: undefined,
        },
      });
    }
  });

<<<<<<< HEAD
  test("Should return all projects even though there is no secondary technical lead", async () => {
    const projects = await privateCloudProjectsPaginated(10, 1);

    expect(projects.data.length).toBe(10);
  });

  test("Should return all projects with secondary technical lead", async () => {
    // Create 10 more projects with secondary technical lead
    for (let i = 10; i < 20; i++) {
      await prisma.privateCloudProject.create({
        data: {
          ...createProject,
          name: createProject.name + i,
          licencePlate: "123456" + i,
        },
      });
    }

    const projects = await privateCloudProjectsPaginated(20, 1);

    expect(projects.data.length).toBe(20);
  });

  test("Should return only projects belonging to specific user when userEmail is passed", async () => {
    // Create 10 more projects with secondary technical lead
    for (let i = 20; i < 30; i++) {
      await prisma.privateCloudProject.create({
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
=======
  test("Should return all requests even though there is no secondary technical lead", async () => {
    const projects = await privateCloudRequestsPaginated(5, 1);
    expect(projects.data.length).toBe(5);
  });

  test("Should return all projects even though there is no secondary technical lead", async () => {
    const projects = await privateCloudProjectsPaginated(5, 1);
    expect(projects.data.length).toBe(5);
  });

  
  test("Should return only projects belonging to specific user when userEmail is passed", async () => {
    // Create 3 more projects with secondary technical lead, and different project lead
    for (let i = 5; i < 8; i++) {
      await prisma.privateCloudRequest.create({
        data: {
          type: RequestType.CREATE,
          decisionStatus: DecisionStatus.PENDING,
          active: true,
          createdByEmail: projectData2.projectOwner.email,
          licencePlate: "123456" + i,
          requestedProject: {
            create: createProjectObject(projectData2)
          },
          userRequestedProject: {
            create: createProjectObject(projectData2)
          },
        },
        include: {
          requestedProject: {
            include: {
              projectOwner: true,
              primaryTechnicalLead: true,
              secondaryTechnicalLead: true,
>>>>>>> main
            },
          },
        },
      });
    }
<<<<<<< HEAD

    const allProjects = await privateCloudProjectsPaginated(30, 1);
    expect(
      allProjects.data.some(
        (project) =>
          project.primaryTechnicalLeadDetails.email === "testUser@test.com"
      )
    ).toBe(true);

    const projects = await privateCloudProjectsPaginated(
      30,
=======
    
    const projects = await privateCloudRequestsPaginated(
      10,
>>>>>>> main
      1,
      undefined,
      undefined,
      undefined,
<<<<<<< HEAD
      "testUser@test.com"
    );

    expect(projects.data.length).toBe(10);
=======
      "christopher.tan@gov.bc.ca",
      );
    expect(projects.total).toBe(3);
  });

  test("Should return all projects with secondary technical lead", async () => {
    // Create 3 more projects with secondary technical lead, and different project lead
    for (let i = 5; i < 8; i++) {
      await prisma.privateCloudProject.create({
        data: {
          ...projectObject2,
          name: projectData2.name + i,
          licencePlate: "123456" + i,
        },
      });
    }

    const projects = await privateCloudRequestsPaginated(
      10,
      1,
      undefined,
      undefined,
      undefined,
      "christopher.tan@gov.bc.ca",
    );

    expect(projects.data.length).toBe(3);
  });


  test("Should return only requests that fits the SearchTerm", async () => {
    const projects = await privateCloudRequestsPaginated(
      10,
      1,
      "sample",
    );

    expect(projects.total).toBe(5);
  });

  test("Should return only projects that fits the SearchTerm", async () => {
    const projects = await privateCloudProjectsPaginated(
      10,
      1,
      "sample",
    );
    //projects searches for description, unlike requests
    expect(projects.total).toBe(8);
  });

  test("Should return only requests that fits the Cluster", async () => {
    const Allprojects = await privateCloudRequestsPaginated(
      10,
      1,
      undefined,
      undefined,
      "CLAB",
    );

    expect(Allprojects.total).toBe(5);
  });

  test("Should return only projects that fits the SearchTerm", async () => {
    const projects = await privateCloudProjectsPaginated(
      10,
      1,
      undefined,
      undefined,
      "CLAB",
    );

    expect(projects.total).toBe(5);
>>>>>>> main
  });
});
