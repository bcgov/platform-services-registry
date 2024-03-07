import { PrivateCloudRequest, Prisma, User, $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import _isEqual from 'lodash-es/isEqual';
import _uniqWith from 'lodash-es/uniqWith';

interface QuotaChanges {
  [key: string]: {
    all: number;
    [$Enums.DecisionStatus.APPROVED]: number;
    [$Enums.DecisionStatus.REJECTED]: number;
  };
}

const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

function parseDate(date: Date) {
  return formatter.format(date);
}

export async function usersWithQuotaEditRequests(): Promise<User[]> {
  const quotaChangedRequests = await prisma.privateCloudRequest.findMany({
    where: {
      isQuotaChanged: true,
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

  let users = quotaChangedRequests
    .map((request) => {
      const { primaryTechnicalLead, secondaryTechnicalLead, projectOwner } = request.requestedProject;
      return [primaryTechnicalLead, secondaryTechnicalLead, projectOwner];
    })
    .flat()
    .filter(Boolean);

  users = _uniqWith(users, (user1, user2) => user1?.id === user2?.id);

  return users as User[];
}

export async function quotaEditRequests() {
  const quotaChangedRequests = await prisma.privateCloudRequest.findMany({
    where: {
      isQuotaChanged: true,
      decisionStatus: { notIn: [$Enums.DecisionStatus.PENDING] },
    },
    select: {
      created: true,
      decisionStatus: true,
    },
  });

  const result: QuotaChanges = {};

  for (const request of quotaChangedRequests) {
    const date = parseDate(request.created);
    if (!result[date]) {
      result[date] = { all: 0, [$Enums.DecisionStatus.APPROVED]: 0, [$Enums.DecisionStatus.REJECTED]: 0 };
    }

    result[date].all++;

    switch (request.decisionStatus) {
      case $Enums.DecisionStatus.APPROVED:
      case $Enums.DecisionStatus.PROVISIONED:
        result[date][$Enums.DecisionStatus.APPROVED]++;
        break;
      case $Enums.DecisionStatus.REJECTED:
        result[date][$Enums.DecisionStatus.REJECTED]++;
        break;
    }
  }

  const data = Object.entries(result).map(([date, counts]) => ({
    date,
    'All quota requests': counts.all,
    'Approved quota requests': counts[$Enums.DecisionStatus.APPROVED],
    'Rejected quota requests': counts[$Enums.DecisionStatus.REJECTED],
  }));

  return data;
}
