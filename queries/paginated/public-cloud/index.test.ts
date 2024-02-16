import { publicCloudProjectsPaginated, publicCloudRequestsPaginated } from '@/queries/paginated/public-cloud';
import prisma from '@/lib/prisma';
import {
  Provider,
  DecisionStatus,
  Ministry,
  Prisma,
  PublicCloudProject,
  ProjectStatus,
  RequestType,
  User,
} from '@prisma/client';
import { DefaultCpuOptionsSchema, DefaultMemoryOptionsSchema, DefaultStorageOptionsSchema } from '@/schema';
// import { cleanUp } from "@/jest.setup";
import { expect } from '@jest/globals';
import { findMockUserByIDIR } from '@/helpers/mock-users';

const quota = {
  cpu: DefaultCpuOptionsSchema.enum.CPU_REQUEST_0_5_LIMIT_1_5,
  memory: DefaultMemoryOptionsSchema.enum.MEMORY_REQUEST_2_LIMIT_4,
  storage: DefaultStorageOptionsSchema.enum.STORAGE_1,
};

const projectData = {
  name: 'Sample Project',
  description: 'This is a sample project description.',
  provider: Provider.AWS, // Assuming CLUSTER_A is a valid enum value for Cluster
  ministry: Ministry.AG, // Assuming AGRI is a valid enum value for Ministry
  accountCoding: '123456789000000000000000',
  budget: {
    dev: 1000,
    test: 2000,
    prod: 3000,
    tools: 4000,
  },
  projectOwner: findMockUserByIDIR('JOHNDOE'),
  primaryTechnicalLead: findMockUserByIDIR('JAMESSMITH'),
  secondaryTechnicalLead: findMockUserByIDIR('DAVIDJOHNSON'),
  productionQuota: quota,
  testQuota: quota,
  toolsQuota: quota,
  developmentQuota: quota,
};

const projectData2 = {
  name: 'Project',
  description: 'This is a sample project description.',
  provider: Provider.AWS, // Assuming CLUSTER_A is a valid enum value for Cluster
  ministry: Ministry.AG, // Assuming AGRI is a valid enum value for Ministry
  projectOwner: findMockUserByIDIR('SARAHWILLIAMS'),
  primaryTechnicalLead: findMockUserByIDIR('MICHAELBROWN'),
  secondaryTechnicalLead: findMockUserByIDIR('JESSICADAVIS'),
  accountCoding: '123456789000000000000000',
  budget: {
    dev: 1000,
    test: 2000,
    prod: 3000,
    tools: 4000,
  },
};

function createProjectObject(data: any) {
  const createProject = {
    name: data.name,
    description: data.description,
    provider: data.provider, // Assuming CLUSTER_A is a valid enum value for Cluster
    ministry: data.ministry, // Assuming AGRI is a valid enum value for Ministry
    status: ProjectStatus.ACTIVE,
    licencePlate: '654321',
    accountCoding: data.accountCoding,
    budget: data.budget,
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
  };
  return createProject;
}

const projectObject = createProjectObject(projectData);
const projectObject2 = createProjectObject(projectData2);

describe('Query projects with filter and search and pagination', () => {
  beforeAll(async () => {
    for (let i = 0; i < 5; i++) {
      // Create 5 requests without secondary technical lead
      await prisma.publicCloudRequest.create({
        data: {
          type: RequestType.CREATE,
          decisionStatus: DecisionStatus.PENDING,
          active: true,
          createdByEmail: projectData.projectOwner.email,
          licencePlate: '123456' + i,
          requestedProject: {
            create: projectObject,
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
      await prisma.publicCloudProject.create({
        data: {
          ...projectObject,
          name: projectObject.name + i,
          licencePlate: '123456' + i,
          secondaryTechnicalLead: undefined,
        },
      });
    }
  });

  test('Should return all projects when pageSize is 0 and limit is 0', async () => {
    const projects = await publicCloudProjectsPaginated(0, 0);
    expect(projects.data.length).toBe(5);
  });

  test('Should return all projects when the pageSize is the total and the skip is 0', async () => {
    const projects = await publicCloudProjectsPaginated(5, 0);
    expect(projects.data.length).toBe(5);
  });

  test('Should return all requests when the pageSize is the total (5) and the page is 1', async () => {
    const requests = await publicCloudRequestsPaginated(5, 1);
    expect(requests.data.length).toBe(5);
  });

  test('There should be 3 projects if the page size is 3 and the page is 1', async () => {
    const requests = await publicCloudRequestsPaginated(3, 1);
    expect(requests.data.length).toBe(3);
  });

  test('There should be 2 projects if the page size is 3 and the page is 2', async () => {
    const requests = await publicCloudRequestsPaginated(3, 2);
    expect(requests.data.length).toBe(2);
  });

  test('Should return only projects belonging to specific user when userEmail is passed', async () => {
    // Create 3 more projects with secondary technical lead, and different project lead
    for (let i = 5; i < 8; i++) {
      await prisma.publicCloudRequest.create({
        data: {
          type: RequestType.CREATE,
          decisionStatus: DecisionStatus.PENDING,
          active: true,
          createdByEmail: projectData2.projectOwner.email,
          licencePlate: '123456' + i,
          requestedProject: {
            create: createProjectObject(projectData2),
          },
          userRequestedProject: {
            create: createProjectObject(projectData2),
          },
        },
        include: {
          requestedProject: {
            include: {
              projectOwner: true,
              primaryTechnicalLead: true,
              secondaryTechnicalLead: true,
            },
          },
        },
      });
    }

    const projects = await publicCloudRequestsPaginated(
      10,
      1,
      undefined,
      undefined,
      undefined,
      projectData2.projectOwner.email,
      ['ministry-citz-admin'],
    );
    expect(projects.total).toBe(3);
  });

  test('Should return all projects with secondary technical lead', async () => {
    // Create 3 more projects with secondary technical lead, and different project lead
    for (let i = 5; i < 8; i++) {
      await prisma.publicCloudProject.create({
        data: {
          ...projectObject2,
          name: projectData2.name + i,
          licencePlate: '123456' + i,
        },
      });
    }

    const projects = await publicCloudRequestsPaginated(
      10,
      1,
      undefined,
      undefined,
      undefined,
      projectData2.projectOwner.email,
      ['ministry-citz-admin'],
    );

    expect(projects.data.length).toBe(3);
  });

  test('Should return only requests that fits the SearchTerm', async () => {
    const projects = await publicCloudRequestsPaginated(10, 1, 'sample');

    expect(projects.total).toBe(5);
  });

  test('Should return only projects that fits the SearchTerm', async () => {
    const projects = await publicCloudProjectsPaginated(10, 0, 'sample');
    // projects searches for description, unlike requests
    expect(projects.total).toBe(8);
  });

  test('Should return only requests that fits the Provider', async () => {
    const Allprojects = await publicCloudRequestsPaginated(10, 1, undefined, undefined, 'AWS');

    expect(Allprojects.total).toBe(8);
  });

  test('Should return only projects that fits the SearchTerm', async () => {
    const projects = await publicCloudProjectsPaginated(10, 0, undefined, undefined, 'AWS');

    expect(projects.total).toBe(8);
  });
});
