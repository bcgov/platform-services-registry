import { PrivateCloudRequestedProject, DecisionStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import _isEqual from 'lodash-es/isEqual';

export type DataPoint = {
  date: string;
  'Quota requests': number;
};

function createMonthKey(date: Date) {
  const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: '2-digit' });
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

export function sortDatesIntoMonths(dates: Date[]) {
  const monthlyChanges: { [key: string]: Date[] } = {};
  dates.forEach((date) => {
    const monthKey = createMonthKey(date);
    if (!monthlyChanges[monthKey]) {
      monthlyChanges[monthKey] = [];
    }
    monthlyChanges[monthKey].push(date);
  });
  return monthlyChanges;
}

export async function detectQuotaChangesByMonth(licencePlate: string, decisionStatus?: DecisionStatus) {
  const requests = await prisma.privateCloudRequest.findMany({
    where: { licencePlate, decisionStatus },
    orderBy: { created: 'asc' },
    select: { requestedProject: true },
  });

  const projects = requests.map((request) => request.requestedProject);

  const quotaChangeDates = [];

  for (let i = 0; i < projects.length - 1; i++) {
    if (isQuotaChanged(projects[i], projects[i + 1])) {
      quotaChangeDates.push(projects[i + 1].created);
    }
  }

  const monthlyChanges = sortDatesIntoMonths(quotaChangeDates);
  return monthlyChanges;
}

export async function quotaEditRequests(decisionStatus?: DecisionStatus) {
  const projects = await prisma.privateCloudProject.findMany({
    select: { licencePlate: true },
  });

  const licencePlates = projects.map((project) => project.licencePlate);

  const allMonthlyChanges: { [key: string]: Date[] } = {};

  for (const licencePlate of licencePlates) {
    const monthlyChanges = await detectQuotaChangesByMonth(licencePlate, decisionStatus);

    for (const monthKey in monthlyChanges) {
      if (!allMonthlyChanges[monthKey]) {
        allMonthlyChanges[monthKey] = [];
      }
      allMonthlyChanges[monthKey].push(...monthlyChanges[monthKey]);
    }
  }

  const final: DataPoint[] = [];

  Object.keys(allMonthlyChanges).forEach((monthKey) => {
    final.push({
      date: monthKey,
      'Quota requests': allMonthlyChanges[monthKey].length,
    });
  });

  return final;
}
