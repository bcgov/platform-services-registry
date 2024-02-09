import { PrivateCloudRequestedProject, DecisionStatus, RequestType } from '@prisma/client';
import prisma from '@/lib/prisma';
import _isEqual from 'lodash-es/isEqual';
import { DefaultCpuOptionsSchema, DefaultMemoryOptionsSchema, DefaultStorageOptionsSchema } from '@/schema';

const defaultQuota = {
  cpu: DefaultCpuOptionsSchema.enum.CPU_REQUEST_0_5_LIMIT_1_5,
  memory: DefaultMemoryOptionsSchema.enum.MEMORY_REQUEST_2_LIMIT_4,
  storage: DefaultStorageOptionsSchema.enum.STORAGE_1,
};

const defaultQuotaProject = {
  productionQuota: defaultQuota,
  testQuota: defaultQuota,
  toolsQuota: defaultQuota,
  developmentQuota: defaultQuota,
};

export type DataPoint = {
  date: string;
  'Quota requests': number;
};

export type CombinedDataPoint = {
  date: string;
  'All quota requests': number;
  'Approved quota requests': number;
  'Rejected quota requests': number;
};

const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

function createMonthKey(date: Date) {
  return formatter.format(date);
}

export function isQuotaChanged(
  projectOne: PrivateCloudRequestedProject,
  projectTwo: PrivateCloudRequestedProject,
): boolean {
  // Assuming productionQuota, testQuota, developmentQuota, and toolsQuota are defined and comparable
  return !(
    _isEqual(projectOne.productionQuota, projectTwo.productionQuota) &&
    _isEqual(projectOne.testQuota, projectTwo.testQuota) &&
    _isEqual(projectOne.developmentQuota, projectTwo.developmentQuota) &&
    _isEqual(projectOne.toolsQuota, projectTwo.toolsQuota)
  );
}

export async function quotaEditRequests(decisionStatus?: DecisionStatus) {
  const requests = await prisma.privateCloudRequest.findMany({
    where: {
      type: RequestType.EDIT,
      decisionStatus,
    },
    include: {
      requestedProject: true,
    },
    orderBy: {
      created: 'desc',
    },
  });

  const result: { [key: string]: number } = {};
  const nonQuotaChangeResult: { [key: string]: number } = {};

  // Iterate through requests and compare the current edit requested with the previous edit request in time for the same licence plate.
  // If the quota has changed, add it to the result object. If there is no previous request, compare it to the default quota.
  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];

    const nextEditRequest = requests.slice(i + 1).find((r) => r.licencePlate === request.licencePlate);

    const nextRequest = !nextEditRequest
      ? { requestedProject: defaultQuotaProject as PrivateCloudRequestedProject }
      : nextEditRequest;

    const quotaChanged: boolean = isQuotaChanged(request.requestedProject, nextRequest.requestedProject);
    const date = createMonthKey(request.created);

    if (quotaChanged) {
      result[date] = (result[date] || 0) + 1;
    }
  }

  const data = Object.entries(result).map(([date, count]) => ({
    date,
    'Quota requests': count,
  }));

  return data;
}

export async function combinedQuotaEditRequests() {
  const getAllQuotaEditRequests = quotaEditRequests();
  const getApprovedQuotaEditRequests = quotaEditRequests(DecisionStatus.APPROVED);
  const getRejectedQuotaEditRequests = quotaEditRequests(DecisionStatus.REJECTED);

  const [allData, approvedData, rejectedData] = await Promise.all([
    getAllQuotaEditRequests,
    getApprovedQuotaEditRequests,
    getRejectedQuotaEditRequests,
  ]);

  const allDates = Array.from(
    new Set([
      ...allData.map((item) => item.date),
      ...approvedData.map((item) => item.date),
      ...rejectedData.map((item) => item.date),
    ]),
  );

  const data: CombinedDataPoint[] = allDates
    .map((date) => {
      const [all] = allData.filter((d) => d.date === date);
      const [approved] = approvedData.filter((d) => d.date === date);
      const [rejected] = rejectedData.filter((d) => d.date === date);

      return {
        date,
        'All quota requests': all?.['Quota requests'] || 0,
        'Approved quota requests': approved?.['Quota requests'] || 0,
        'Rejected quota requests': rejected?.['Quota requests'] || 0,
      };
    })
    .reverse();

  return data;
}
