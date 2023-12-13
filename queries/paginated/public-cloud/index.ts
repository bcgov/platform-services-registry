import prisma from '@/lib/prisma';
import {
  getPublicCloudProjectsQuery,
  getPublicCloudProjectsResult,
  getPublicCloudProjectsTotalCount,
} from '@/queries/paginated/public-cloud/helpers';
import { PublicProject } from '@/queries/types';

export async function publicCloudProjectsPaginated(
  pageSize: number,
  skip: number,
  searchTerm?: string | null,
  ministry?: string | null,
  provider?: string | null, // Non admins will be required to pass this field that will filter projects for their user
  userEmail?: string | null,
  ministryRoles?: string[],
  active?: boolean | null,
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
    active: !!active,
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
  userEmail?: string,
  ministryRoles: string[] = [],
  active: boolean = true,
): Promise<{
  data: any[];
  total: number;
}> {
  const searchQuery: any = active ? { active: true } : {};

  if (searchTerm) {
    // Add other filter conditions here
    searchQuery.$or = [
      { 'requestedProject.name': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.ministry': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.provider': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.licencePlate': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.projectOwner.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.projectOwner.firstName': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.projectOwner.lastName': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.primaryTechnicalLead.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.primaryTechnicalLead.firstName': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.primaryTechnicalLead.lastName': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.secondaryTechnicalLead.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.secondaryTechnicalLead.firstName': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.secondaryTechnicalLead.lastName': { $regex: searchTerm, $options: 'i' } },
    ];
  }

  if (ministry) {
    searchQuery['requestedProject.ministry'] = ministry;
  }

  if (provider) {
    searchQuery['requestedProject.provider'] = provider;
  }

  if (provider) {
    searchQuery['requestedProject.provider'] = provider;
  }

  if (userEmail) {
    searchQuery.$and = [
      {
        $or: [
          {
            'requestedProject.projectOwner.email': {
              $regex: userEmail,
              $options: 'i',
            },
          },
          {
            'requestedProject.primaryTechnicalLead.email': {
              $regex: userEmail,
              $options: 'i',
            },
          },
          {
            'requestedProject.secondaryTechnicalLead.email': {
              $regex: userEmail,
              $options: 'i',
            },
          },
          {
            'requestedProject.requestedProject.ministry': { $in: ministryRoles },
          },
        ],
      },
    ];
  }

  const count = await prisma.publicCloudRequest.aggregateRaw({
    pipeline: [
      // User Requested Project
      {
        $lookup: {
          from: 'PublicCloudRequestedProject',
          localField: 'userRequestedProjectId',
          foreignField: '_id',
          as: 'userRequestedProject',
        },
      },
      { $unwind: '$userRequestedProject' },
      {
        $lookup: {
          from: 'User',
          localField: 'userRequestedProject.projectOwnerId',
          foreignField: '_id',
          as: 'userRequestedProject.projectOwner',
        },
      },
      { $unwind: '$userRequestedProject.projectOwner' },
      {
        $lookup: {
          from: 'User',
          localField: 'userRequestedProject.primaryTechnicalLeadId',
          foreignField: '_id',
          as: 'userRequestedProject.primaryTechnicalLead',
        },
      },
      { $unwind: '$userRequestedProject.primaryTechnicalLead' },
      {
        $lookup: {
          from: 'User',
          localField: 'userRequestedProject.secondaryTechnicalLeadId',
          foreignField: '_id',
          as: 'userRequestedProject.secondaryTechnicalLead',
        },
      },
      {
        $unwind: {
          path: '$userRequestedProject.secondaryTechnicalLead',
          preserveNullAndEmptyArrays: true,
        },
      },

      // Requested Project
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
          as: 'requestedProject.projectOwner',
        },
      },
      { $unwind: '$requestedProject.projectOwner' },
      {
        $lookup: {
          from: 'User',
          localField: 'requestedProject.primaryTechnicalLeadId',
          foreignField: '_id',
          as: 'requestedProject.primaryTechnicalLead',
        },
      },
      { $unwind: '$requestedProject.primaryTechnicalLead' },
      {
        $lookup: {
          from: 'User',
          localField: 'requestedProject.secondaryTechnicalLeadId',
          foreignField: '_id',
          as: 'requestedProject.secondaryTechnicalLead',
        },
      },
      {
        $unwind: {
          path: '$requestedProject.secondaryTechnicalLead',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: searchQuery },
      {
        $addFields: {
          id: { $toString: '$_id' },
          'requestedProject.id': { $toString: '$requestedProject._id' },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ],
  });

  const result = await prisma.publicCloudRequest.aggregateRaw({
    pipeline: [
      // Requested Project
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
          as: 'requestedProject.projectOwner',
        },
      },
      { $unwind: '$requestedProject.projectOwner' },
      {
        $lookup: {
          from: 'User',
          localField: 'requestedProject.primaryTechnicalLeadId',
          foreignField: '_id',
          as: 'requestedProject.primaryTechnicalLead',
        },
      },
      { $unwind: '$requestedProject.primaryTechnicalLead' },
      {
        $lookup: {
          from: 'User',
          localField: 'requestedProject.secondaryTechnicalLeadId',
          foreignField: '_id',
          as: 'requestedProject.secondaryTechnicalLead',
        },
      },
      {
        $unwind: {
          path: '$requestedProject.secondaryTechnicalLead',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: searchQuery },
      { $sort: { created: -1 } },
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
  const totalCount = count.length;
  return {
    data: result as any,
    total: totalCount,
  };
}
