import { DecisionStatus, Prisma, User } from '@prisma/client';
import _isEqual from 'lodash-es/isEqual';
import _uniqWith from 'lodash-es/uniqWith';
import prisma from '@/core/prisma';
import { getProdClusterLicencePlates } from './common';

interface QuotaChanges {
  [key: string]: {
    all: number;
    [DecisionStatus.APPROVED]: number;
    [DecisionStatus.REJECTED]: number;
  };
}

const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

function parseDate(date: Date) {
  return formatter.format(date);
}

export async function usersWithQuotaEditRequests(): Promise<User[]> {
  const prodClusterLicencePlates = await getProdClusterLicencePlates();
  const quotaChangedRequests = await prisma.privateCloudRequest.findMany({
    where: {
      licencePlate: { in: prodClusterLicencePlates },
      isQuotaChanged: true,
    },
    include: {
      decisionData: {
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
      const { primaryTechnicalLead, secondaryTechnicalLead, projectOwner } = request.decisionData;
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
      decisionStatus: { notIn: [DecisionStatus.PENDING] },
    },
    select: {
      createdAt: true,
      decisionStatus: true,
    },
  });

  const result: QuotaChanges = {};

  for (const request of quotaChangedRequests) {
    const date = parseDate(request.createdAt);
    if (!result[date]) {
      result[date] = { all: 0, [DecisionStatus.APPROVED]: 0, [DecisionStatus.REJECTED]: 0 };
    }

    result[date].all++;

    switch (request.decisionStatus) {
      case DecisionStatus.APPROVED:
      case DecisionStatus.AUTO_APPROVED:
      case DecisionStatus.PROVISIONED:
        result[date][DecisionStatus.APPROVED]++;
        break;
      case DecisionStatus.REJECTED:
        result[date][DecisionStatus.REJECTED]++;
        break;
    }
  }

  const data = Object.entries(result).map(([date, counts]) => ({
    date,
    'All quota requests': counts.all,
    'Approved quota requests': counts[DecisionStatus.APPROVED],
    'Rejected quota requests': counts[DecisionStatus.REJECTED],
  }));

  return data;
}
