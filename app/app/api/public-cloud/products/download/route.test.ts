import { expect } from '@jest/globals';
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
import { parse } from 'csv-parse/sync';
import { MockedFunction } from 'jest-mock';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/core/prisma';
import { findMockUserByIDIR, generateTestSession } from '@/helpers/mock-users';
import { ministryKeyToName } from '@/helpers/product';
import { createProxyUsers } from '@/queries/users';
import { DefaultCpuOptionsSchema, DefaultMemoryOptionsSchema, DefaultStorageOptionsSchema } from '@/schema';
import { POST as downloadCsv } from './route';

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/public-cloud/products/download`;

const mockedGetServerSession = getServerSession as unknown as MockedFunction<typeof getServerSession>;

const generatePostRequest = (data = {}) => {
  return new NextRequest(API_URL, { method: 'POST', body: JSON.stringify(data) });
};

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
    environmentsEnabled: {
      development: true,
      test: true,
      production: true,
      tools: true,
    },
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
  Name: string;
  Description: string;
  Ministry: string;
  Provider: string;
  'Project Owner Email': string;
  'Project Owner Name': string;
  'Primary Technical Lead Email': string;
  'Primary Technical Lead Name': string;
  'Secondary Technical Lead Email': string;
  'Secondary Technical Lead Name': string;
  'Create Date': string;
  'Update Date': string;
  'Licence Plate': string;
  Status: string;
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

    const req = generatePostRequest();
    const response = await downloadCsv(req);
    expect(response.status).toBe(401);
  });

  test('should return CSV data for all projects', async () => {
    const mockedSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockedSession);

    const req = generatePostRequest();
    const response = await downloadCsv(req);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
  });

  test('should handle invalid query params properly', async () => {
    // Mock a valid session and an empty dataset scenario
    const mockedSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockedSession);

    // Simulate a request that would result in an empty dataset
    const req = generatePostRequest({
      search: 'NonExistentSearchTerm',
      ministry: 'NonExistentMinsitry',
      provider: 'NonExistentProvider',
    });

    const response = await downloadCsv(req);
    expect(response.status).toBe(400);
  });

  test('should return correct CSV data with all query parameters', async () => {
    const mockedSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockedSession);

    const req = generatePostRequest({
      search: 'TestProject',
      ministry: 'AG',
      provider: 'AWS',
      includeInactive: false,
    });

    const response = await downloadCsv(req);
    expect(response.status).toBe(200);

    // Parse the CSV content
    const csvContent = await response.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as CsvRecord[];

    // Check if CSV contains data related to 'TestProject', 'AG', 'AWS', and is active.
    const relevantRecord = records.find(
      (record: CsvRecord) =>
        record.Name.includes('TestProject') && record.Ministry === ministryKeyToName('AG') && record.Provider === 'AWS',
    );
    expect(relevantRecord).toBeDefined();
  });

  test('should handle invalid query parameters correctly', async () => {
    const mockedSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockedSession);

    // Create a request with invalid query parameters
    const req = generatePostRequest({
      search: '',
      ministry: 'InvalidMinistry',
      provider: 'InvalidProvider',
      includeInactive: false,
    });

    // Call the downloadCsv function with the request
    const response = await downloadCsv(req);
    expect(response.status).toBe(400);
  });

  test('should return correct data for combined search and filter parameters', async () => {
    const mockedSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockedSession);

    // Define different combinations of search and filter parameters
    const testData = [
      { search: 'Sample Project', ministry: 'AG', provider: 'AWS' },
      { search: 'TestProject', ministry: 'AG', provider: 'AWS' },
    ];

    for (const tdata of testData) {
      const req = generatePostRequest(tdata);

      const response = await downloadCsv(req);
      expect(response.status).toBe(200);

      const csvContent = await response.text();
      const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as CsvRecord[];

      // Check if data matches the combination criteria
      let found = false;
      for (const record of records) {
        if (
          record.Name === tdata.search &&
          record.Ministry === ministryKeyToName(tdata.ministry) &&
          record.Provider === tdata.provider
        ) {
          found = true;
          break;
        }
      }
      expect(found).toBeTruthy(); // Verify that the expected record was found
    }
  });
});
