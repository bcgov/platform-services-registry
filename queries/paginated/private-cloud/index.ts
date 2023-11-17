import prisma from '@/lib/prisma';
import {
  getPrivateCloudProjectsQuery,
  getPrivateCloudProjectsTotalCount,
  getPrivateCloudProjectsResult,
} from '@/queries/private-cloud/helpers';
import { PrivateProject } from '@/queries/types';
import { userInfo } from '@/queries/user';

export async function privateCloudProjectsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string | null,
  ministry?: string | null,
  cluster?: string | null, // Non admins will be required to pass this field that will filter projects for thier user
): Promise<{
  data: PrivateProject[];
  total: number;
}> {
  // Initialize the search/filter query
  const searchQuery = getPrivateCloudProjectsQuery({
    searchTerm,
    ministry,
    cluster,
  });

  const proms = [];
  // First, get the total count of matching documents
  proms.push(getPrivateCloudProjectsTotalCount({ searchQuery }));

  // Then, get the actual page of data
  proms.push(getPrivateCloudProjectsResult({ searchQuery, pageNumber, pageSize }));

  const [total, data] = await Promise.all(proms);

  return {
    data: data as PrivateProject[],
    total: total as number,
  };
}

export async function privateCloudRequestsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string,
  ministry?: string,
  cluster?: string,
  active: boolean = true,
): Promise<{
  data: any[];
  total: number;
}> {
  const searchQuery: any = active ? { active: true } : {};
  const user = await userInfo();

  if (searchTerm) {
    searchQuery.$or = [
      { 'requestedProject.name': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.ministry': { $regex: searchTerm, $options: 'i' } },
    ];
  }

  if (ministry) {
    searchQuery['requestedProject.ministry'] = ministry;
  }

  if (cluster) {
    searchQuery['requestedProject.cluster'] = cluster;
  }

  if (cluster) {
    searchQuery['requestedProject.cluster'] = cluster;
  }

  if (user?.userEmail) {
    searchQuery.$and = [
      {
        $or: [
          { 'projectOwner.email': { $regex: user?.userEmail, $options: 'i' } },
          {
            'primaryTechnicalLead.email': { $regex: user?.userEmail, $options: 'i' },
          },
          {
            'secondaryTechnicalLead.email': {
              $regex: user?.userEmail,
              $options: 'i',
            },
          },
          {
            'requestedProject.ministry': user?.ministryRole,
          },
        ],
      },
    ];
  }

  const totalCountResult = await prisma.privateCloudRequest.aggregateRaw({
    pipeline: [
      {
        $lookup: {
          from: 'PrivateCloudRequestedProject',
          localField: 'requestedProjectId',
          foreignField: '_id',
          as: 'requestedProject',
        },
      },
      { $unwind: '$requestedProject' },
      {
        $lookup: {
          from: 'User',
          localField: 'requestedProject.projectOwnerId',
          foreignField: '_id',
          as: 'projectOwner',
        },
      },
      { $unwind: '$projectOwner' },
      {
        $lookup: {
          from: 'User',
          localField: 'requestedProject.primaryTechnicalLeadId',
          foreignField: '_id',
          as: 'primaryTechnicalLead',
        },
      },
      { $unwind: '$primaryTechnicalLead' },
      {
        $lookup: {
          from: 'User',
          localField: 'requestedProject.secondaryTechnicalLeadId',
          foreignField: '_id',
          as: 'secondaryTechnicalLead',
        },
      },
      {
        $unwind: {
          path: '$secondaryTechnicalLead',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $unwind: '$requestedProject' },
      { $match: searchQuery },
      { $count: 'totalCount' },
    ],
  });

  const result = await prisma.privateCloudRequest.aggregateRaw({
    pipeline: [
      {
        $lookup: {
          from: 'PrivateCloudRequestedProject',
          localField: 'requestedProjectId',
          foreignField: '_id',
          as: 'requestedProject',
        },
      },
      { $unwind: '$requestedProject' },
      {
        $lookup: {
          from: 'User',
          localField: 'requestedProject.projectOwnerId',
          foreignField: '_id',
          as: 'projectOwner',
        },
      },
      { $unwind: '$projectOwner' },
      {
        $lookup: {
          from: 'User',
          localField: 'requestedProject.primaryTechnicalLeadId',
          foreignField: '_id',
          as: 'primaryTechnicalLead',
        },
      },
      { $unwind: '$primaryTechnicalLead' },
      {
        $lookup: {
          from: 'User',
          localField: 'requestedProject.secondaryTechnicalLeadId',
          foreignField: '_id',
          as: 'secondaryTechnicalLead',
        },
      },
      {
        $unwind: {
          path: '$secondaryTechnicalLead',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: searchQuery },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
      {
        $addFields: {
          id: { $toString: '$_id' },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ],
  });

  // @ts-ignore
  const totalCount = totalCountResult[0]?.totalCount || 0;

  return {
    data: result as any,
    total: totalCount,
  };
}
