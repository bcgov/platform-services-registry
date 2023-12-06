import { NextRequest, NextResponse } from 'next/server';
import { GET as downloadCsv } from '@/app/api/private-cloud/allprojects/route';
import { getServerSession } from 'next-auth/next';
import { MockedFunction } from 'jest-mock';
import { expect } from '@jest/globals';
import prisma from '@/lib/prisma';
import {
  Cluster,
  DecisionStatus,
  Ministry,
  Prisma,
  PrivateCloudProject,
  ProjectStatus,
  RequestType,
  User,
} from '@prisma/client';
import { DefaultCpuOptionsSchema, DefaultMemoryOptionsSchema, DefaultStorageOptionsSchema } from '@/schema';
// import { cleanUp } from "@/jest.setup";

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/private-cloud/allprojects`;

// Mocking getServerSession
const mockedGetServerSession = getServerSession as unknown as MockedFunction<typeof getServerSession>;

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

const quota = {
  cpu: DefaultCpuOptionsSchema.enum.CPU_REQUEST_0_5_LIMIT_1_5,
  memory: DefaultMemoryOptionsSchema.enum.MEMORY_REQUEST_2_LIMIT_4,
  storage: DefaultStorageOptionsSchema.enum.STORAGE_1,
};

const projectData = [
  {
    name: 'Sample Project',
    description: 'This is a sample project description.',
    cluster: Cluster.CLAB,
    ministry: Ministry.AG,
    projectOwner: {
      firstName: 'Oamar',
      lastName: 'Kanji',
      email: 'oamar.kanji@gov.bc.ca',
      ministry: Ministry.AG,
    },
    primaryTechnicalLead: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      ministry: Ministry.AG,
    },
    secondaryTechnicalLead: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      ministry: Ministry.AG,
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
  },
  {
    name: 'Project',
    description: 'This is a sample project description.',
    cluster: Cluster.SILVER,
    ministry: Ministry.AG,
    projectOwner: {
      firstName: 'Christopher',
      lastName: 'Tan',
      email: 'christopher.tan@gov.bc.ca',
      ministry: Ministry.AG,
    },
    primaryTechnicalLead: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      ministry: Ministry.AG,
    },
    secondaryTechnicalLead: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      ministry: Ministry.AG,
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
  },
];

// Function to create a project object
function createProjectObject(data: any, index: number) {
  return {
    name: data.name,
    description: data.description,
    cluster: data.cluster,
    ministry: data.ministry,
    status: ProjectStatus.ACTIVE,
    licencePlate: `LP${index}`,
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
}

describe('CSV Download Route', () => {
  beforeAll(async () => {
    // Seed the database with unique projects
    for (let i = 0; i < projectData.length; i++) {
      const project = createProjectObject(projectData[i], i);
      await prisma.privateCloudProject.create({ data: project });
    }
  });

  // Clean up database after tests are done
  afterAll(async () => {
    await prisma.privateCloudProject.deleteMany({});
  });

  test('should return 401 if user is not authenticated', async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const req = new NextRequest(API_URL, {
      method: 'GET',
    });

    const response = await downloadCsv(req);
    expect(response.status).toBe(401);
  });

  test('should return CSV data for all projects', async () => {
    // Mock a valid session
    mockedGetServerSession.mockResolvedValue({
      user: { email: 'user@example.com', roles: ['admin'] },
    });

    const req = new NextRequest(API_URL, { method: 'GET' });

    const response = await downloadCsv(req);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
  });

  test('should handle empty data sets correctly', async () => {
    // Mock a valid session and an empty dataset scenario
    mockedGetServerSession.mockResolvedValue({
      user: {
        email: 'user@example.com',
        roles: ['admin'],
      },
    });

    // Simulate a request that would result in an empty dataset
    const req = new NextRequest(API_URL, {
      method: 'GET',
      headers: {
        'x-mock-query': JSON.stringify({
          search: 'NonExistentSearchTerm',
          ministry: 'NonExistentMinistry',
          cluster: ['NonExistentCluster'],
        }),
      },
    });

    const response = await downloadCsv(req);
    //console.log('Response:', response);
    expect(response.status).toBe(204); //handling empty datasets differently, such as 204 No Content
  });
});
