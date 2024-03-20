import { NextRequest, NextResponse } from 'next/server';
import { GET as downloadCsv } from '@/app/api/private-cloud/all-projects/route';
import { getServerSession } from 'next-auth/next';
import { MockedFunction } from 'jest-mock';
import { expect } from '@jest/globals';
import prisma from '@/core/prisma';
import { parse } from 'csv-parse/sync';
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
import { findMockUserByIDIR, generateTestSession } from '@/helpers/mock-users';
import { createProxyUsers } from '@/queries/users';

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/private-cloud/all-projects`;

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
    projectOwner: findMockUserByIDIR('JOHNDOE'),
    primaryTechnicalLead: findMockUserByIDIR('JAMESSMITH'),
    secondaryTechnicalLead: findMockUserByIDIR('DAVIDJOHNSON'),
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
    name: 'TestProject',
    description: 'This is a test project description.',
    cluster: Cluster.SILVER,
    ministry: Ministry.AG,
    projectOwner: findMockUserByIDIR('JOHNDOE'),
    primaryTechnicalLead: findMockUserByIDIR('JAMESSMITH'),
    secondaryTechnicalLead: findMockUserByIDIR('DAVIDJOHNSON'),
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

interface CsvRecord {
  name: string;
  description: string;
  ministry: string;
  cluster: string;
  projectOwnerEmail: string;
  projectOwnerName: string;
  primaryTechnicalLeadEmail: string;
  primaryTechnicalLeadName: string;
  secondaryTechnicalLeadEmail: string;
  secondaryTechnicalLeadName: string;
  created: string;
  licencePlate: string;
}

describe('CSV Download Route', () => {
  beforeAll(async () => {
    console.log('Seeding database with projects');
    await createProxyUsers();

    for (let i = 0; i < projectData.length; i++) {
      const project = createProjectObject(projectData[i], i);
      await prisma.privateCloudProject.create({ data: project });
    }
    await prisma.privateCloudProject.findMany({});
  });

  // Clean up database after tests are done
  afterAll(async () => {
    console.log('Cleaning up database');
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
    const mockSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockSession);

    const req = new NextRequest(API_URL, { method: 'GET' });

    const response = await downloadCsv(req);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
  });

  test('should handle invalid query params correctly', async () => {
    const mockSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockSession);

    // Simulate a request that would result in an empty dataset
    const req = new NextRequest(
      `${API_URL}?search=NonExistentSearchTerm&ministry=NonExistentMinsitry&cluster=NonExistentCluster`,
      {
        method: 'GET',
      },
    );

    const response = await downloadCsv(req);
    expect(response.status).toBe(400);
  });

  test('should return correct CSV data with all query parameters', async () => {
    const mockSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockSession);

    const req = new NextRequest(`${API_URL}?search=TestProject&ministry=AG&cluster=SILVER&active=true`, {
      method: 'GET',
    });

    const response = await downloadCsv(req);
    expect(response.status).toBe(200);

    // Parse the CSV content
    const csvContent = await response.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as CsvRecord[];

    // Check if CSV contains data related to 'TestProject', 'AG', 'SILVER', and is active.
    const relevantRecord = records.find(
      (record: CsvRecord) =>
        record.name.includes('TestProject') && record.ministry === 'AG' && record.cluster === 'SILVER',
    );
    expect(relevantRecord).toBeDefined();
  });

  test('should handle invalid query parameters correctly', async () => {
    const mockSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockSession);

    // Create a request with invalid query parameters
    const req = new NextRequest(`${API_URL}?search=*&ministry=InvalidMinistry&cluster=InvalidCluster&active=maybe`, {
      method: 'GET',
    });

    // Call the downloadCsv function with the request
    const response = await downloadCsv(req);
    expect(response.status).toBe(400);
  });

  test('should return correct data for combined search and filter parameters', async () => {
    const mockSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockSession);

    // Define different combinations of search and filter parameters
    const testCombinations = [
      { search: 'Sample Project', ministry: 'AG', cluster: 'CLAB' },
      { search: 'TestProject', ministry: 'AG', cluster: 'SILVER' },
    ];

    for (const combo of testCombinations) {
      // Create a new object with only defined properties
      const definedParams = Object.fromEntries(Object.entries(combo).filter(([_, v]) => v !== undefined));

      // Create query string from the defined parameters
      const queryParams = new URLSearchParams(definedParams).toString();
      const req = new NextRequest(`${API_URL}?${queryParams}`, { method: 'GET' });

      const response = await downloadCsv(req);
      expect(response.status).toBe(200);

      const csvContent = await response.text();
      const records = parse(csvContent, { columns: true, skip_empty_lines: true });

      // Check if data matches the combination criteria
      records.forEach((record: { name: any; ministry: any; cluster: any }) => {
        if (combo.search) {
          expect(record.name).toContain(combo.search);
        }
        if (combo.ministry) {
          expect(record.ministry).toBe(combo.ministry);
        }
        if (combo.cluster) {
          expect(record.cluster).toBe(combo.cluster);
        }
      });
    }
  });
});
