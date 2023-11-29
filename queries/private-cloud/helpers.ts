import prisma from '@/lib/prisma';
import { PrivateProject } from '@/queries/types';

export async function getPrivateCloudProjectsQuery({
  searchTerm,
  ministry,
  cluster,
  userEmail,
  ministryRoles,
}: {
  searchTerm?: string | null;
  ministry?: string | null;
  cluster?: string | string[] | null;
  userEmail?: string | null;
  ministryRoles?: string[];
}) {
  // Initialize the search/filter query
  const searchQuery: any = {
    status: 'ACTIVE',
  };

  // Construct search/filter conditions based on provided parameters
  if (searchTerm) {
    searchQuery.$or = [
      {
        'projectOwnerDetails.email': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'projectOwnerDetails.firstName': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'projectOwnerDetails.lastName': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'primaryTechnicalLeadDetails.email': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'primaryTechnicalLeadDetails.firstName': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'primaryTechnicalLeadDetails.lastName': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'secondaryTechnicalLeadDetails.email': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'secondaryTechnicalLeadDetails.firstName': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'secondaryTechnicalLeadDetails.lastName': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { licencePlate: { $regex: searchTerm, $options: 'i' } },
      { cluster: { $regex: searchTerm, $options: 'i' } },
      { ministry: { $regex: searchTerm, $options: 'i' } },

      // include other fields as necessary
    ];
  }

  if (ministry) {
    searchQuery.ministry = ministry;
  }

  if (userEmail) {
    searchQuery.$and = [
      {
        $or: [
          {
            'projectOwnerDetails.email': {
              $regex: userEmail,
              $options: 'i',
            },
          },
          {
            'primaryTechnicalLeadDetails.email': {
              $regex: userEmail,
              $options: 'i',
            },
          },
          {
            'secondaryTechnicalLeadDetails.email': {
              $regex: userEmail,
              $options: 'i',
            },
          },
          {
            ministry: { $in: ministryRoles },
          },
        ],
      },
    ];
  }

  if (cluster) {
    if (Array.isArray(cluster)) {
      if (cluster.length > 0) searchQuery.cluster = { $in: cluster };
    } else {
      searchQuery.cluster = cluster;
    }
  }

  return searchQuery;
}

export async function getPrivateCloudProjectsTotalCount({ searchQuery }: { searchQuery: any }) {
  const result: unknown = await prisma.privateCloudProject.aggregateRaw({
    pipeline: [
      {
        $lookup: {
          from: 'User',
          localField: 'projectOwnerId',
          foreignField: '_id',
          as: 'projectOwnerDetails',
        },
      },
      {
        $lookup: {
          from: 'User',
          localField: 'primaryTechnicalLeadId',
          foreignField: '_id',
          as: 'primaryTechnicalLeadDetails',
        },
      },
      {
        $lookup: {
          from: 'User',
          localField: 'secondaryTechnicalLeadId',
          foreignField: '_id',
          as: 'secondaryTechnicalLeadDetails',
        },
      },
      { $match: searchQuery },
      { $unwind: '$projectOwnerDetails' },
      { $count: 'totalCount' },
    ],
  });

  const totalCountResult = result as { totalCount: number }[];
  if (totalCountResult.length > 0) return totalCountResult[0].totalCount ?? 0;
  return 0;
}

export async function getPrivateCloudProjectsResult({
  searchQuery,
  pageNumber,
  pageSize,
}: {
  searchQuery: any;
  pageNumber?: number;
  pageSize?: number;
}) {
  let paginationPipelines: any[] = [];
  if (pageNumber && pageSize) {
    paginationPipelines = [{ $skip: (pageNumber - 1) * pageSize }, { $limit: pageSize }];
  }

  const result = await prisma.privateCloudProject.aggregateRaw({
    pipeline: [
      {
        $lookup: {
          from: 'User',
          localField: 'projectOwnerId',
          foreignField: '_id',
          as: 'projectOwnerDetails',
        },
      },
      {
        $lookup: {
          from: 'User',
          localField: 'primaryTechnicalLeadId',
          foreignField: '_id',
          as: 'primaryTechnicalLeadDetails',
        },
      },
      {
        $lookup: {
          from: 'User',
          localField: 'secondaryTechnicalLeadId',
          foreignField: '_id',
          as: 'secondaryTechnicalLeadDetails',
        },
      },
      { $match: searchQuery },
      { $unwind: '$projectOwnerDetails' },
      { $unwind: '$primaryTechnicalLeadDetails' },
      {
        $unwind: {
          path: '$secondaryTechnicalLeadDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      ...paginationPipelines,
      {
        $addFields: {
          id: { $toString: '$_id' }, // Convert _id to string
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id field from the result
        },
      },
    ],
  });

  return result as unknown as PrivateProject[];
}
