import prisma from '@/core/prisma';
import { PublicProject } from '@/queries/types';

export async function getPublicCloudProjectsQuery({
  searchTerm,
  ministry,
  provider,
  userEmail,
  ministryRoles,
  active,
}: {
  searchTerm?: string | null;
  ministry?: string | null;
  provider?: string | string[] | null;
  userEmail?: string | null;
  ministryRoles?: string[];
  active?: boolean;
}) {
  // Initialize the search/filter query
  const searchQuery: any = active
    ? {
        status: 'ACTIVE',
      }
    : {};

  // Construct search/filter conditions based on provided parameters
  if (searchTerm) {
    searchQuery.$or = [
      {
        'projectOwner.email': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'projectOwner.firstName': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'projectOwner.lastName': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'primaryTechnicalLead.email': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'primaryTechnicalLead.firstName': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'primaryTechnicalLead.lastName': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'secondaryTechnicalLead.email': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'secondaryTechnicalLead.firstName': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      {
        'secondaryTechnicalLead.lastName': {
          $regex: searchTerm,
          $options: 'i',
        },
      },
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { licencePlate: { $regex: searchTerm, $options: 'i' } },
      { provider: { $regex: searchTerm, $options: 'i' } },
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
            ministry: { $in: ministryRoles },
          },
        ],
      },
    ];
  }

  if (provider) {
    if (Array.isArray(provider)) {
      if (provider.length > 0) searchQuery.provider = { $in: provider };
    } else {
      searchQuery.provider = provider;
    }
  }

  return searchQuery;
}

export async function getPublicCloudProjectsTotalCount({ searchQuery }: { searchQuery: any }) {
  const result: unknown = await prisma.publicCloudProject.aggregateRaw({
    pipeline: [
      {
        $lookup: {
          from: 'User',
          localField: 'projectOwnerId',
          foreignField: '_id',
          as: 'projectOwner',
        },
      },
      {
        $lookup: {
          from: 'User',
          localField: 'primaryTechnicalLeadId',
          foreignField: '_id',
          as: 'primaryTechnicalLead',
        },
      },
      {
        $lookup: {
          from: 'User',
          localField: 'secondaryTechnicalLeadId',
          foreignField: '_id',
          as: 'secondaryTechnicalLead',
        },
      },
      { $match: searchQuery },
      { $unwind: '$projectOwner' },
      { $count: 'totalCount' },
    ],
  });

  const totalCountResult = result as { totalCount: number }[];
  if (totalCountResult.length > 0) return totalCountResult[0].totalCount ?? 0;
  return 0;
}

export async function getPublicCloudProjectsResult({
  searchQuery,
  skip,
  pageSize,
}: {
  searchQuery: any;
  skip?: number;
  pageSize?: number;
}) {
  const paginationPipelines = pageSize === 0 ? [] : [{ $skip: skip }, { $limit: pageSize }];

  const result = await prisma.publicCloudProject.aggregateRaw({
    pipeline: [
      {
        $lookup: {
          from: 'PublicCloudRequest', // The foreign collection
          let: { projectId: '$_id' }, // Define variable for use in the pipeline
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$projectId', '$$projectId'] }, // Match projectId
                    { $eq: ['$active', true] }, // Match active requests
                  ],
                },
              },
            },
            // You can add other stages here if needed
          ],
          as: 'activeRequest', // Output array field
        },
      },
      {
        $addFields: {
          activeRequestCount: { $size: '$activeRequest' },
        },
      },
      {
        $lookup: {
          from: 'User',
          localField: 'projectOwnerId',
          foreignField: '_id',
          as: 'projectOwner',
        },
      },
      {
        $lookup: {
          from: 'User',
          localField: 'primaryTechnicalLeadId',
          foreignField: '_id',
          as: 'primaryTechnicalLead',
        },
      },
      {
        $lookup: {
          from: 'User',
          localField: 'secondaryTechnicalLeadId',
          foreignField: '_id',
          as: 'secondaryTechnicalLead',
        },
      },
      { $unwind: '$projectOwner' },
      { $unwind: '$primaryTechnicalLead' },
      {
        $unwind: {
          path: '$secondaryTechnicalLead',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: searchQuery },
      { $sort: { updatedAt: -1 } },

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

  return result as unknown as PublicProject[];
}
