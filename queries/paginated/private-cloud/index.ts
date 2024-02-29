import prisma from '@/lib/prisma';
import {
  getPrivateCloudProjectsQuery,
  getPrivateCloudProjectsResult,
  getPrivateCloudProjectsTotalCount,
} from '@/queries/paginated/private-cloud/helpers';
import { PrivateProject } from '@/queries/types';

export async function privateCloudProjectsPaginated(
  pageSize: number,
  skip: number,
  searchTerm?: string | null,
  ministry?: string | null,
  cluster?: string | null, // Non admins will be required to pass this field that will filter projects for their user
  userEmail?: string | null,
  ministryRoles?: string[],
  active = true,
): Promise<{
  data: PrivateProject[];
  total: number;
}> {
  // Initialize the search/filter query
  const searchQuery = await getPrivateCloudProjectsQuery({
    searchTerm,
    ministry,
    cluster,
    userEmail,
    ministryRoles,
    active,
  });

  const proms = [];
  // First, get the total count of matching documents
  proms.push(getPrivateCloudProjectsTotalCount({ searchQuery }));

  // Then, get the actual page of data
  proms.push(getPrivateCloudProjectsResult({ searchQuery, skip, pageSize }));

  let result;

  try {
    result = await Promise.all(proms);
  } catch (e) {
    console.log(e);
    return {
      data: [],
      total: 0,
    };
  }

  const [total, data] = result;

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
  userEmail?: string,
  ministryRoles: string[] = [],
  active: boolean = true,
): Promise<{
  data: any[];
  total: number;
}> {
  const searchQuery: any = active ? { active: true } : {};
  // const searchQuery: any = {};

  // if (searchTerm) {
  //   searchQuery.$or = [
  //     { 'requestedProject.name': { $regex: searchTerm, $options: 'i' } },
  //     { 'requestedProject.ministry': { $regex: searchTerm, $options: 'i' } },
  //   ];
  // }

  if (searchTerm) {
    // Add other filter conditions here
    searchQuery.$or = [
      { 'userRequestedProject.name': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProject.ministry': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProject.cluster': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProject.licencePlate': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProject.projectOwner.email': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProject.projectOwner.firstName': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProject.projectOwner.lastName': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProject.primaryTechnicalLead.email': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProject.primaryTechnicalLead.firstName': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProject.primaryTechnicalLead.lastName': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProject.secondaryTechnicalLead.email': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProject.secondaryTechnicalLead.firstName': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProject.secondaryTechnicalLead.lastName': { $regex: searchTerm, $options: 'i' } },

      { 'requestedProject.name': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.ministry': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.cluster': { $regex: searchTerm, $options: 'i' } },
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

  if (cluster) {
    searchQuery['requestedProject.cluster'] = cluster;
  }

  if (cluster) {
    searchQuery['requestedProject.cluster'] = cluster;
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

          {
            'userRequestedProject.projectOwner.email': {
              $regex: userEmail,
              $options: 'i',
            },
          },
          {
            'userRequestedProject.primaryTechnicalLead.email': {
              $regex: userEmail,
              $options: 'i',
            },
          },
          {
            'userRequestedProject.secondaryTechnicalLead.email': {
              $regex: userEmail,
              $options: 'i',
            },
          },
          {
            'userRequestedProject.requestedProject.ministry': { $in: ministryRoles },
          },
        ],
      },
    ];
  }

  const count = prisma.privateCloudRequest.aggregateRaw({
    pipeline: [
      // User Requested Project
      {
        $lookup: {
          from: 'PrivateCloudRequestedProject',
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
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ],
  });

  const requests = prisma.privateCloudRequest.aggregateRaw({
    pipeline: [
      // User Requested Project
      {
        $lookup: {
          from: 'PrivateCloudRequestedProject',
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
      { $sort: { updatedAt: -1 } },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
      {
        $addFields: {
          id: { $toString: '$_id' },
          'requestedProject.id': { $toString: '$requestedProject._id' },
          'userRequestedProject.id': { $toString: '$userRequestedProject._id' },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ],
  });

  let result;

  try {
    result = await Promise.all([count, requests]);
  } catch (e) {
    console.log(e);
    return {
      data: [],
      total: 0,
    };
  }

  const [total, data] = result;

  // @ts-ignore
  const totalCount = total.length;
  return {
    data: data as any,
    total: totalCount as number,
  };
}
