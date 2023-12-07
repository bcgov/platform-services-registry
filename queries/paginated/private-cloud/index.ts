import prisma from '@/lib/prisma';
import {
  getPrivateCloudProjectsQuery,
  getPrivateCloudProjectsResult,
  getPrivateCloudProjectsTotalCount,
} from '@/queries/private-cloud/helpers';
import { PrivateProject } from '@/queries/types';

export type Data = PrivateProject & Record<'activeRequest', string>;

export async function privateCloudProjectsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string | null,
  ministry?: string | null,
  cluster?: string | null, // Non admins will be required to pass this field that will filter projects for thier user
  userEmail?: string | null,
  excludeProjectsWithActiveRequest?: boolean,
  ministryRoles?: string[],
): Promise<{
  data: Data[];
  total: number;
}> {
  // Initialize the search/filter query
  const searchQuery = await getPrivateCloudProjectsQuery({
    searchTerm,
    ministry,
    cluster,
    userEmail,
    excludeProjectsWithActiveRequest,
    ministryRoles,
  });

  const proms = [];
  // First, get the total count of matching documents
  proms.push(getPrivateCloudProjectsTotalCount({ searchQuery }));

  // Then, get the actual page of data
  proms.push(getPrivateCloudProjectsResult({ searchQuery, pageNumber, pageSize }));

  const [total, data] = await Promise.all(proms);

  return {
    data: data as Data[],
    total: total as number,
  };
}

export async function privateCloudRequestsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string,
  ministry?: string,
  cluster?: string,
  type?: string,
  userEmail?: string,
  ministryRoles: string[] = [],
  active: boolean = true,
): Promise<{
  data: any[];
  total: number;
}> {
  // Constructing the search and filter query

  const searchQuery: any = {};
  const filterQuery: any = {};

  if (searchTerm) {
    // Add other filter conditions here
    searchQuery.$or = [
      { 'requestedProject.name': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProject.name': { $regex: searchTerm, $options: 'i' } },
      { 'projectOwnerDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProjectProjectOwnerDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProjectPrimaryTechnicalLeadDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'userRequestedProjectSecondaryTechnicalLeadDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectProjectOwnerDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectPrimaryTechnicalLeadDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectSecondaryTechnicalLeadDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectProjectOwnerDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectPrimaryTechnicalLeadDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectSecondaryTechnicalLeadDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectProjectOwnerDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectPrimaryTechnicalLeadDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectSecondaryTechnicalLeadDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectProjectOwnerDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectPrimaryTechnicalLeadDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectSecondaryTechnicalLeadDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectProjectOwnerDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectPrimaryTechnicalLeadDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectSecondaryTechnicalLeadDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectProjectOwnerDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectPrimaryTechnicalLeadDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectSecondaryTechnicalLeadDetails.email': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProjectProjectOwnerDetails.email': { $regex: searchTerm, $options: 'i' } },
    ];
  }

  if (active) {
    filterQuery.active = true;
  }
  if (type) {
    filterQuery.type = type;
  }

  // Ministry and Cluster Filters
  if (ministry) {
    filterQuery['requestedProject.ministry'] = ministry;
    filterQuery['userRequestedProject.ministry'] = ministry;
  }

  if (cluster) {
    filterQuery['requestedProject.cluster'] = cluster;
    filterQuery['userRequestedProject.cluster'] = cluster;
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

  // Aggregation pipeline
  const pipeline = [
    { $match: filterQuery },
    {
      $lookup: {
        from: 'PrivateCloudRequestedProject',
        localField: 'requestedProjectId',
        foreignField: '_id',
        as: 'requestedProject',
      },
    },
    {
      $lookup: {
        from: 'PrivateCloudRequestedProject',
        localField: 'userRequestedProjectId',
        foreignField: '_id',
        as: 'userRequestedProject',
      },
    },
    { $unwind: { path: '$requestedProject', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$userRequestedProject', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'User',
        localField: 'userRequestedProject.projectOwnerId',
        foreignField: '_id',
        as: 'userRequestedProjectProjectOwnerDetails',
      },
    },
    {
      $lookup: {
        from: 'User',
        localField: 'userRequestedProject.primaryTechnicalLeadId',
        foreignField: '_id',
        as: 'userRequestedProjectPrimaryTechnicalLeadDetails',
      },
    },
    {
      $lookup: {
        from: 'User',
        localField: 'userRequestedProject.secondaryTechnicalLeadId',
        foreignField: '_id',
        as: 'userRequestedProjectSecondaryTechnicalLeadDetails',
      },
    },
    {
      $lookup: {
        from: 'User',
        localField: 'requestedProject.projectOwnerId',
        foreignField: '_id',
        as: 'requestedProjectProjectOwnerDetails',
      },
    },
    {
      $lookup: {
        from: 'User',
        localField: 'requestedProject.primaryTechnicalLeadId',
        foreignField: '_id',
        as: 'requestedProjectPrimaryTechnicalLeadDetails',
      },
    },
    {
      $lookup: {
        from: 'User',
        localField: 'requestedProject.secondaryTechnicalLeadId',
        foreignField: '_id',
        as: 'requestedProjectSecondaryTechnicalLeadDetails',
      },
    },
    {
      $lookup: {
        from: 'User',
        localField: 'projectOwnerId',
        foreignField: '_id',
        as: 'projectOwnerDetails',
      },
    },
    { $match: searchQuery },

    {
      $sort: {
        type: 1, // Sorting by type in ascending order, use -1 for descending
      },
    },
    // { $skip: (pageNumber - 1) * pageSize },
    // { $limit: pageSize },
    //     // Project the required fields

    {
      $project: {
        _id: 0,
        id: { $toString: '$_id' },
        type: 1,
        active: 1,
        created: 1,
        licencePlate: 1,

        requestedProject: {
          _id: 1,
          name: 1,
          cluster: 1,
          ministry: 1,
          projectOwner: { $arrayElemAt: ['$requestedProjectProjectOwnerDetails', 0] },
          primaryTechnicalLead: { $arrayElemAt: ['$requestedProjectPrimaryTechnicalLeadDetails', 0] },
          secondaryTechnicalLead: { $arrayElemAt: ['$requestedProjectSecondaryTechnicalLeadDetails', 0] },
        },

        userRequestedProject: {
          _id: 1,
          name: 1,
          cluster: 1,
          ministry: 1,
          projectOwner: { $arrayElemAt: ['$userRequestedProjectProjectOwnerDetails', 0] },
          primaryTechnicalLead: { $arrayElemAt: ['$userRequestedProjectPrimaryTechnicalLeadDetails', 0] },
          secondaryTechnicalLead: { $arrayElemAt: ['$userRequestedProjectSecondaryTechnicalLeadDetails', 0] },
        },
      },
    },
  ];

  // Execute the aggregation pipeline
  const result = await prisma.privateCloudRequest.aggregateRaw({
    pipeline: [...pipeline, ...[{ $skip: (pageNumber - 1) * pageSize }, { $limit: pageSize }]],
  });
  const total = await prisma.privateCloudRequest.aggregateRaw({ pipeline });

  const count = total.length;

  return { data: result, total: count };
}
