import { expect } from '@jest/globals';
import {
  $Enums,
  Cluster,
  DecisionStatus,
  Ministry,
  Prisma,
  PrivateCloudProject,
  ProjectStatus,
  RequestType,
  User,
} from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { MockedFunction } from 'jest-mock';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/core/prisma';
import { createSamplePrivateCloudProductData } from '@/helpers/mock-resources';
import { findMockUserByIDIR, generateTestSession } from '@/helpers/mock-users';
import { ministryKeyToName } from '@/helpers/product';
import { createProxyUsers } from '@/queries/users';
import {
  DefaultCpuOptionsSchema,
  DefaultMemoryOptionsSchema,
  DefaultStorageOptionsSchema,
  PrivateCloudCreateRequestBody,
} from '@/schema';
import { POST as downloadCsv } from './route';

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/private-cloud/products/download`;

const mockedGetServerSession = getServerSession as unknown as MockedFunction<typeof getServerSession>;

const generatePostRequest = (data = {}) => {
  return new NextRequest(API_URL, { method: 'POST', body: JSON.stringify(data) });
};

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

const quota = {
  cpu: DefaultCpuOptionsSchema.enum.CPU_REQUEST_0_5_LIMIT_1_5,
  memory: DefaultMemoryOptionsSchema.enum.MEMORY_REQUEST_2_LIMIT_4,
  storage: DefaultStorageOptionsSchema.enum.STORAGE_1,
};

const projectData = [
  createSamplePrivateCloudProductData({
    data: { name: 'Sample Project', ministry: $Enums.Ministry.AG, cluster: $Enums.Cluster.CLAB },
  }),
  createSamplePrivateCloudProductData({
    data: { name: 'TestProject', ministry: $Enums.Ministry.AG, cluster: $Enums.Cluster.SILVER },
  }),
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
    golddrEnabled: data.golddrEnabled,
    isTest: data.isTest,
  };
}

interface CsvRecord {
  Name: string;
  Description: string;
  Ministry: string;
  Cluster: string;
  'Project Owner Email': string;
  'Project Owner Name': string;
  'Primary Technical Lead Email': string;
  'Primary Technical Lead Name': string;
  'Secondary Technical Lead Email': string;
  'Secondary Technical Lead Name': string;
  'Create Date': string;
  'Updated Date': string;
  'Licence Plate': string;
  'Total Compute Quota (Cores)': string;
  'Total Memory Quota (Gb)': string;
  'Total Storage Quota (Gb)': string;
  Status: string;
}

describe('CSV Download Route', () => {
  beforeAll(async () => {
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

    const req = generatePostRequest();
    const response = await downloadCsv(req);
    expect(response.status).toBe(401);
  });

  test('should return CSV data for all projects', async () => {
    const mockSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockSession);

    const req = generatePostRequest();
    const response = await downloadCsv(req);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
  });

  test('should handle invalid query params correctly', async () => {
    const mockSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockSession);

    const req = generatePostRequest({
      search: 'NonExistentSearchTerm',
      ministry: 'NonExistentMinsitry',
      cluster: 'NonExistentCluster',
    });

    const response = await downloadCsv(req);
    expect(response.status).toBe(400);
  });

  test('should return correct CSV data with all query parameters', async () => {
    const mockSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockSession);

    const req = generatePostRequest({
      search: 'TestProject',
      ministry: $Enums.Ministry.AG,
      cluster: $Enums.Cluster.SILVER,
      includeInactive: false,
    });

    const response = await downloadCsv(req);
    expect(response.status).toBe(200);

    // Parse the CSV content
    const csvContent = await response.text();
    const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as CsvRecord[];

    // Check if CSV contains data related to 'TestProject', 'AG', 'SILVER', and is active.
    const relevantRecord = records.find(
      (record) =>
        record.Name.includes('TestProject') &&
        record.Ministry === ministryKeyToName('AG') &&
        record.Cluster === 'SILVER',
    );

    expect(relevantRecord).toBeDefined();
  });

  test('should handle invalid query parameters correctly', async () => {
    const mockSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockSession);

    // Create a request with invalid query parameters
    const req = generatePostRequest({
      search: '*',
      ministry: 'InvalidMinistry',
      cluster: 'InvalidCluster',
      includeInactive: false,
    });

    // Call the downloadCsv function with the request
    const response = await downloadCsv(req);
    expect(response.status).toBe(400);
  });

  test('should return correct data for combined search and filter parameters', async () => {
    const mockSession = await generateTestSession('admin.system@gov.bc.ca');
    mockedGetServerSession.mockResolvedValue(mockSession);

    // Define different combinations of search and filter parameters
    const testData = [
      { search: 'Sample Project', ministry: 'AG', cluster: 'CLAB' },
      { search: 'TestProject', ministry: 'AG', cluster: 'SILVER' },
    ];

    for (const tdata of testData) {
      const req = generatePostRequest(tdata);
      const response = await downloadCsv(req);
      expect(response.status).toBe(200);

      const csvContent = await response.text();
      const records = parse(csvContent, { columns: true, skip_empty_lines: true }) as CsvRecord[];

      // Check if data matches the combination criteria
      records.forEach((record) => {
        if (tdata.search) {
          expect(record.Name).toContain(tdata.search);
        }
        if (tdata.ministry) {
          expect(record.Ministry).toBe(ministryKeyToName(tdata.ministry));
        }
        if (tdata.cluster) {
          expect(record.Cluster).toBe(tdata.cluster);
        }
      });
    }
  });
});
