import { privateCloudProjects } from '@/queries/private-cloud';
import prisma from '@/lib/prisma';
import {
  Prisma,
  RequestType,
  DecisionStatus,
  ProjectStatus,
  PrivateCloudProject,
  Ministry,
  Cluster,
  User,
} from '@prisma/client';
import { DefaultCpuOptionsSchema, DefaultMemoryOptionsSchema, DefaultStorageOptionsSchema } from '@/schema';
// import { cleanUp } from "@/jest.setup";

const quota = {
  cpu: DefaultCpuOptionsSchema.enum.CPU_REQUEST_0_5_LIMIT_1_5,
  memory: DefaultMemoryOptionsSchema.enum.MEMORY_REQUEST_2_LIMIT_4,
  storage: DefaultStorageOptionsSchema.enum.STORAGE_1,
};

const projectData = {
  name: 'Sample Project',
  description: 'This is a sample project description.',
  cluster: Cluster.CLAB, // Assuming CLUSTER_A is a valid enum value for Cluster
  ministry: Ministry.AG, // Assuming AGRI is a valid enum value for Ministry
  projectOwner: {
    firstName: 'Oamar',
    lastName: 'Kanji',
    email: 'oamar.kanji@gov.bc.ca',
    ministry: Ministry.AG, // Assuming AGRI is a valid enum value for Ministry
  },
  primaryTechnicalLead: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    ministry: Ministry.AG, // Assuming AGRI is a valid enum value for Ministry
  },
  secondaryTechnicalLead: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
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
    other: 'Some other services',
    noServices: false,
  },
};

const projectData2 = {
  name: 'Project',
  description: 'This is a sample project description.',
  cluster: Cluster.SILVER, // Assuming CLUSTER_A is a valid enum value for Cluster
  ministry: Ministry.AG, // Assuming AGRI is a valid enum value for Ministry
  projectOwner: {
    firstName: 'Christopher',
    lastName: 'Tan',
    email: 'christopher.tan@gov.bc.ca',
    ministry: Ministry.AG, // Assuming AGRI is a valid enum value for Ministry
  },
  primaryTechnicalLead: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    ministry: Ministry.AG, // Assuming AGRI is a valid enum value for Ministry
  },
  secondaryTechnicalLead: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
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
    other: 'Some other services',
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
    licencePlate: '654321',
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

describe('Query projects with filter and search', () => {
  const seededProjectsCount = 5;

  beforeAll(async () => {
    // Seed the database with 5 projects
    for (let i = 0; i < seededProjectsCount; i++) {
      await prisma.privateCloudProject.create({
        data: {
          ...projectObject,
          name: projectObject.name + i,
          licencePlate: '123456' + i,
          secondaryTechnicalLead: undefined,
        },
      });
    }
  });

  afterAll(async () => {
    // Cleanup the database by removing the seeded projects
    for (let i = 0; i < seededProjectsCount; i++) {
      const projectToDelete = await prisma.privateCloudProject.findFirst({
        where: { name: projectObject.name + i },
      });
      if (projectToDelete) {
        await prisma.privateCloudProject.delete({
          where: { id: projectToDelete.id },
        });
      }
    }
  });

  test('Should return all projects ', async () => {
    const projects = await privateCloudProjects();
    expect(projects.length).toBe(5);
  });

  test('Should return only projects that fits the SearchTerm', async () => {
    const projects = await privateCloudProjects('Sample Project1');
    expect(projects.length).toBe(1);
  });

  test('Should return no projects for a search tearm non included in any projects', async () => {
    const projects = await privateCloudProjects('abcdefg');
    expect(projects.length).toBe(0);
  });

  test('Should return all projects', async () => {
    const projects = await privateCloudProjects();
    expect(projects.length).toBe(seededProjectsCount);
  });

  //This test was previously failing because the correct parameter is 'projectOwnerDetails' and NOT 'projectOwner'
  test('Should return only projects belonging to specific user when userEmail is passed', async () => {
    const specificUserEmail = 'jane.smith@example.com';
    const projects = await privateCloudProjects(null, null, null, specificUserEmail);
    //console.log(projects);

    // Ensure all returned projects belong to the user with the provided email
    for (const project of projects) {
      const emails = [];
      if (project.projectOwnerDetails) emails.push(project.projectOwnerDetails.email);
      if (project.primaryTechnicalLeadDetails) emails.push(project.primaryTechnicalLeadDetails.email);
      if (project.secondaryTechnicalLeadDetails) emails.push(project.secondaryTechnicalLeadDetails.email);

      expect(emails).toContain(specificUserEmail);
    }
  });

  test('Should return no projects when a non-associated userEmail is passed', async () => {
    const nonAssociatedEmail = 'non.associated@example.com';
    const projects = await privateCloudProjects(null, null, null, nonAssociatedEmail);

    // Expecting no projects to be returned for a non-associated email
    expect(projects.length).toBe(0);
  });

  test('Should return projects filtered by both cluster and ministry', async () => {
    const clusterFilter = Cluster.CLAB;
    const ministryFilter = Ministry.AG;

    const projects = await privateCloudProjects(null, ministryFilter, clusterFilter);

    // Make sure all returned projects match the criteria
    for (const project of projects) {
      expect(project.cluster).toBe(clusterFilter);
      expect(project.ministry).toBe(ministryFilter);
    }
  });

  // Test filtering by searchTerm and ministry
  test('Should return projects filtered by searchTerm and ministry', async () => {
    const searchTerm = 'Sample Project1';
    const ministryFilter = Ministry.AG;

    const projects = await privateCloudProjects(searchTerm, ministryFilter);

    // Ensure all returned projects match the criteria
    for (const project of projects) {
      expect(project.ministry).toBe(ministryFilter);
      expect(project.name).toContain(searchTerm);
    }
  });

  // Test filtering by searchTerm, ministry, and userEmail
  test('Should return projects filtered by searchTerm, ministry, and userEmail', async () => {
    const searchTerm = 'Sample Project1';
    const ministryFilter = Ministry.AG;
    const specificUserEmail = 'jane.smith@example.com';

    const projects = await privateCloudProjects(searchTerm, ministryFilter, null, specificUserEmail);

    for (const project of projects) {
      expect(project.ministry).toBe(ministryFilter);
      expect(project.name).toContain(searchTerm);

      const emails = [];
      if (project.projectOwnerDetails) emails.push(project.projectOwnerDetails.email);
      if (project.primaryTechnicalLeadDetails) emails.push(project.primaryTechnicalLeadDetails.email);
      if (project.secondaryTechnicalLeadDetails) emails.push(project.secondaryTechnicalLeadDetails.email);

      expect(emails).toContain(specificUserEmail);
    }
  });

  // Test filtering by cluster and userEmail
  test('Should return projects filtered by cluster and userEmail', async () => {
    const clusterFilter = Cluster.CLAB;
    const specificUserEmail = 'jane.smith@example.com';

    const projects = await privateCloudProjects(null, null, clusterFilter, specificUserEmail);

    for (const project of projects) {
      expect(project.cluster).toBe(clusterFilter);

      const emails = [];
      if (project.projectOwnerDetails) emails.push(project.projectOwnerDetails.email);
      if (project.primaryTechnicalLeadDetails) emails.push(project.primaryTechnicalLeadDetails.email);
      if (project.secondaryTechnicalLeadDetails) emails.push(project.secondaryTechnicalLeadDetails.email);

      expect(emails).toContain(specificUserEmail);
    }
  });

  test('Should return an empty array when no projects match the query', async () => {
    const searchTerm = 'nonexistent';
    const ministryFilter = 'nonexistentMinistry';
    const clusterFilter = 'nonexistentCluster';
    const userEmail = 'nonexistent@example.com';

    const projects = await privateCloudProjects(searchTerm, ministryFilter, clusterFilter, userEmail);

    expect(projects).toBeDefined();
    expect(projects).toHaveLength(0);
  });
});
