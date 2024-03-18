import { NextRequest, NextResponse } from 'next/server';
import { GET as downloadCsv } from '@/app/api/public-cloud/all-projects/route';
import { getServerSession } from 'next-auth/next';
import { MockedFunction } from 'jest-mock';
import { expect } from '@jest/globals';
import prisma from '@/core/prisma';
import { parse } from 'csv-parse/sync';
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
import { findMockUserByIDIR, generateTestSession } from '@/helpers/mock-users';
import { createProxyUsers } from '@/queries/users';

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/public-cloud/all-projects`;

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
  },
  {
    name: 'TestProject',
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
  },
];

// Function to create a project object
function createProjectObject(data: any, index: number) {
  return {
    name: data.name,
    description: data.description,
    provider: data.provider,
    ministry: data.ministry,
    status: ProjectStatus.ACTIVE,
    licencePlate: `LP${index}`,
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
}

interface CsvRecord {
  name: string;
  description: string;
  ministry: string;
  provider: string;
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
      await prisma.publicCloudProject.create({ data: project });
    }

    await prisma.publicCloudProject.findMany({});
  });

  // Clean up database after tests are done
  afterAll(async () => {
    console.log('Cleaning up database');
    await prisma.publicCloudProject.deleteMany({});
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
    const mockedSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockedSession);

    const req = new NextRequest(API_URL, { method: 'GET' });

    const response = await downloadCsv(req);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
  });

  test('should handle invalid query params properly', async () => {
    // Mock a valid session and an empty dataset scenario
    const mockedSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockedSession);

    // Simulate a request that would result in an empty dataset
    const req = new NextRequest(
      `${API_URL}?search=NonExistentSearchTerm&ministry=NonExistentMinsitry&provider=NonExistentProvider`,
      {
        method: 'GET',
      },
    );

    const response = await downloadCsv(req);
    expect(response.status).toBe(400);
  });

  test('should return correct CSV data with all query parameters', async () => {
    const mockedSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockedSession);

    const req = new NextRequest(`${API_URL}?search=TestProject&ministry=AG&provider=AWS&active=true`, {
      method: 'GET',
    });

    const queryParams = {
      search: req.nextUrl.searchParams.get('search'),
      ministry: req.nextUrl.searchParams.get('ministry'),
      provider: req.nextUrl.searchParams.get('provider'),
      active: req.nextUrl.searchParams.get('active'),
    };

    const response = await downloadCsv(req);
    expect(response.status).toBe(200);

    // Parse the CSV content
    const csvContent = await response.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as CsvRecord[];

    // Check if CSV contains data related to 'TestProject', 'AG', 'AWS', and is active.
    const relevantRecord = records.find(
      (record: CsvRecord) =>
        record.name.includes('TestProject') && record.ministry === 'AG' && record.provider === 'AWS',
    );
    expect(relevantRecord).toBeDefined();
  });

  test('should handle invalid query parameters correctly', async () => {
    const mockedSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockedSession);

    // Create a request with invalid query parameters
    const req = new NextRequest(`${API_URL}?search=&ministry=InvalidMinistry&provider=InvalidProvider&active=maybe`, {
      method: 'GET',
    });

    // Call the downloadCsv function with the request
    const response = await downloadCsv(req);
    expect(response.status).toBe(400);
  });

  test('should return correct data for combined search and filter parameters', async () => {
    const mockedSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockedSession);

    // Define different combinations of search and filter parameters
    const testCombinations = [
      { search: 'Sample Project', ministry: 'AG', provider: 'AWS' },
      { search: 'TestProject', ministry: 'AG', provider: 'AWS' },
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
      let found = false;
      for (const record of records) {
        if (record.name === combo.search && record.ministry === combo.ministry && record.provider === combo.provider) {
          found = true;
          break;
        }
      }
      expect(found).toBeTruthy(); // Verify that the expected record was found
    }
  });
});
