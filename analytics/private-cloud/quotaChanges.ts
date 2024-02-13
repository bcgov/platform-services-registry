import { PrivateCloudRequestedProject, DecisionStatus, RequestType } from '@prisma/client';
import prisma from '@/lib/prisma';
import _isEqual from 'lodash-es/isEqual';
import { DefaultCpuOptionsSchema, DefaultMemoryOptionsSchema, DefaultStorageOptionsSchema } from '@/schema';

const defaultQuota = {
  cpu: DefaultCpuOptionsSchema.enum.CPU_REQUEST_0_5_LIMIT_1_5,
  memory: DefaultMemoryOptionsSchema.enum.MEMORY_REQUEST_2_LIMIT_4,
  storage: DefaultStorageOptionsSchema.enum.STORAGE_1,
};

interface QuotaChanges {
  [key: string]: number;
}

const defaultQuotaProject = {
  productionQuota: defaultQuota,
  testQuota: defaultQuota,
  toolsQuota: defaultQuota,
  developmentQuota: defaultQuota,
};

interface Quota {
  cpu: string;
  memory: string;
  storage: string;
}

export type DataPoint = {
  date: string;
  'Quota requests': number;
};

export type CombinedDataPoint = {
  date: string;
  'All quota requests': number;
};

const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

function parseDate(date: Date) {
  return formatter.format(date);
}

export async function quotaEditRequests(decisionStatus?: DecisionStatus) {
  const projects = await prisma.privateCloudRequestedProject.findMany({
    orderBy: {
      created: 'desc',
    },
  });

  const projectsByLicencePlate: { [licencePlate: string]: PrivateCloudRequestedProject[] } = {};

  // Organize projects by licence plate
  projects.forEach((project) => {
    const licencePlate = project.licencePlate;
    if (!projectsByLicencePlate[licencePlate]) {
      projectsByLicencePlate[licencePlate] = [];
    }
    projectsByLicencePlate[licencePlate].push(project);
  });

  const quotaChangesPerMonth: { [month: string]: number } = {};

  // Compare quotas and count changes per month
  for (const [licencePlate, requestedProjects] of Object.entries(projectsByLicencePlate)) {
    requestedProjects.forEach((project, index) => {
      if (index > 0) {
        // Ensure there's a previous project to compare
        const previousProject = projects[index - 1];
        const projectMonth = parseDate(project.created);
        const quotas = ['productionQuota', 'testQuota', 'developmentQuota', 'toolsQuota'];

        const quotaChanged = quotas.some(
          (quotaType) =>
            JSON.stringify(project[quotaType as keyof PrivateCloudRequestedProject]) !==
            JSON.stringify(previousProject[quotaType as keyof PrivateCloudRequestedProject]),
        );

        if (quotaChanged) {
          if (!quotaChangesPerMonth[projectMonth]) {
            quotaChangesPerMonth[projectMonth] = 0;
          }
          quotaChangesPerMonth[projectMonth] += 1;
        }
      }
    });
  }
  const sortedEntries = Object.entries(quotaChangesPerMonth).sort((a, b) => {
    const dA = new Date(a[0] + ' 1');
    const dB = new Date(b[0] + ' 1');
    return dA.getTime() - dB.getTime();
  });

  // Convert back to an object
  const sortedQuotaChangesPerMonth: QuotaChanges = sortedEntries.reduce((acc: QuotaChanges, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  return sortedQuotaChangesPerMonth;
}

export async function combinedQuotaEditRequests() {
  const result = await quotaEditRequests();

  const data = Object.entries(result).map(([date, count]) => ({
    date,
    'All quota requests': count,
  }));

  return data;
}
