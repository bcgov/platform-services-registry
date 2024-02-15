import { PrivateCloudRequest, Prisma, User } from '@prisma/client';
import prisma from '@/lib/prisma';
import _isEqual from 'lodash-es/isEqual';

interface QuotaChanges {
  [key: string]: number;
}

export type DataPoint = {
  date: string;
  'All quota requests': number;
};

export type PrivateCloudRequestWithRequestedProject = Prisma.PrivateCloudRequestGetPayload<{
  include: {
    requestedProject: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
  };
}>;

export type PrivateCloudRequestedProjectWithContacts = Prisma.PrivateCloudRequestedProjectGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
  };
}>;

const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

function parseDate(date: Date) {
  return formatter.format(date);
}

export async function usersWithQuotaEditRequests(): Promise<User[]> {
  const quotaChangedRequests: PrivateCloudRequestWithRequestedProject[] = await prisma.privateCloudRequest.findMany({
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

  const users = quotaChangedRequests
    .map((request) => {
      const { primaryTechnicalLead, secondaryTechnicalLead, projectOwner } =
        request.requestedProject as PrivateCloudRequestedProjectWithContacts;

      return [primaryTechnicalLead, secondaryTechnicalLead, projectOwner];
    })
    .flat()
    .filter((user, index, self) => self.findIndex((u) => _isEqual(u, user)) === index)
    .filter(Boolean);

  return users as User[];
}

export async function quotaEditRequests(): Promise<DataPoint[]> {
  const quotaChangedRequests: PrivateCloudRequest[] = await prisma.privateCloudRequest.findMany({
    where: {
      isQuotaChanged: true,
    },
  });

  const result: QuotaChanges = {};

  for (const request of quotaChangedRequests) {
    const date = parseDate(request.created);
    if (!result[date]) {
      result[date] = 0;
    }
    result[date]++;
  }

  const data = Object.entries(result).map(([date, count]) => ({
    date,
    'All quota requests': count,
  }));

  return data;
}
