import prisma from '@/lib/prisma';
import {
  getPublicCloudProjectsQuery,
  getPublicCloudProjectsResult,
  getPublicCloudProjectsTotalCount,
} from '@/queries/public-cloud/helpers';
import { PublicProject } from '@/queries/types';

export async function publicCloudProjectsPaginated(
  pageSize: number,
  skip: number,
  searchTerm?: string | null,
  ministry?: string | null,
  provider?: string | null, // Non admins will be required to pass this field that will filter projects for thier user
  userEmail?: string | null,
  ministryRoles?: string[],
): Promise<{
  data: PublicProject[];
  total: number;
}> {
  // Initialize the search/filter query
  const searchQuery = await getPublicCloudProjectsQuery({
    searchTerm,
    ministry,
    provider,
    userEmail,
    ministryRoles,
  });

  const proms = [];
  // First, get the total count of matching documents
  proms.push(getPublicCloudProjectsTotalCount({ searchQuery }));

  // Then, get the actual page of data
  proms.push(getPublicCloudProjectsResult({ searchQuery, skip, pageSize }));

  const [total, data] = await Promise.all(proms);

  return {
    data: data as PublicProject[],
    total: total as number,
  };
}

export async function publicCloudRequestsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string,
  ministry?: string,
  provider?: string,
  userEmail?: string | null,
  ministryRoles?: string[],
  active: boolean = true,
): Promise<{
  data: any[];
  total: number;
}> {
  const searchQuery: any = active ? { active: true } : {};

  if (searchTerm) {
    searchQuery.$or = [
      { 'requestedProject.name': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.ministry': { $regex: searchTerm, $options: 'i' } },
    ];
  }

  if (ministry) {
    searchQuery['requestedProject.ministry'] = ministry;
  }

  if (provider) {
    searchQuery['requestedProject.provider'] = provider;
  }

  if (userEmail) {
    searchQuery.$and = [
      {
        $or: [
          {
            'projectOwner.email': {
              $regex: userEmail,
              $options: 'i',
            },
          },
          {
            'primaryTechnicalLead.email': {
              $regex: userEmail,
              $options: 'i',
            },
          },
          {
            'secondaryTechnicalLead.email': {
              $regex: userEmail,
              $options: 'i',
            },
          },
          {
            'requestedProject.ministry': { $in: ministryRoles },
          },
        ],
      },
    ];
  }

  const totalCountResult = await prisma.publicCloudRequest.aggregateRaw({
    pipeline: [
      {
        $lookup: {
          from: 'PublicCloudRequestedProject',
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

  const result = await prisma.publicCloudRequest.aggregateRaw({
    pipeline: [
      {
        $lookup: {
          from: 'PublicCloudRequestedProject',
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
