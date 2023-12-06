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
  activeRequest?: boolean,
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
    activeRequest,
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
  userEmail?: string | null,
  ministryRoles: string[] = [],
  active: boolean = true,
): Promise<{
  data: any[];
  total: number;
}> {
  // Constructing the search and filter query
  const searchQuery: any = {};
  if (active) {
    searchQuery.active = true;
  }
  if (type) {
    searchQuery.type = type;
  }

  // Ministry and Cluster Filters
  if (ministry) {
    searchQuery['requestedProject.ministry'] = ministry;
    searchQuery['userRequestedProject.ministry'] = ministry;
  }
  if (cluster) {
    searchQuery['requestedProject.cluster'] = cluster;
    searchQuery['userRequestedProject.cluster'] = cluster;
  }

  // Aggregation pipeline
  const pipeline = [
    { $match: searchQuery },
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

    { $unwind: { path: '$userRequestedProjectProjectOwnerDetails', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$userRequestedProjectPrimaryTechnicalLeadDetails', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$userRequestedProjectSecondaryTechnicalLeadDetails', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$requestedProjectProjectOwnerDetails', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$requestedProjectPrimaryTechnicalLeadDetails', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$requestedProjectSecondaryTechnicalLeadDetails', preserveNullAndEmptyArrays: true } },

    // Apply additional filters and search conditions
    {
      $match: {
        // Add other filter conditions here
        $or: [
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
          // Add other searchable fields here
        ],
      },
    },
    // Apply sort, skip, and limit for pagination
    {
      $sort: {
        type: 1, // Sorting by type in ascending order, use -1 for descending
      },
    },
    { $skip: (pageNumber - 1) * pageSize },
    { $limit: pageSize },
    // Project the required fields
    {
      $project: {
        _id: 0,
        id: { $toString: '$_id' },
        userRequestedProject: 1,
        requestedProject: 1,
        projectOwnerDetails: 1,
        primaryTechnicalLeadDetails: 1,
        secondaryTechnicalLeadDetails: 1,
        // Add other fields to project as needed
      },
    },
  ];

  // Execute the aggregation pipeline
  const result = await prisma.privateCloudRequest.aggregateRaw({ pipeline });
  const total = await prisma.privateCloudRequest.count({ where: searchQuery });

  return { data: result, total };
}
