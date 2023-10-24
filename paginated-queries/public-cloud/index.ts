import prisma from '@/lib/prisma';

export interface ProjectOwnerDetails {
  email: string;
  firstName: string;
  lastName: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created: string;
  licencePlate: string;
  provider: string;
  ministry: string;
  status: string;
  projectOwnerId: string;
  primaryTechnicalLeadId: string;
  secondaryTechnicalLeadId: string;
  projectOwnerDetails: ProjectOwnerDetails;
  primaryTechnicalLeadDetails: ProjectOwnerDetails;
  secondaryTechnicalLeadDetails: ProjectOwnerDetails;
}

export async function publicCloudProjectsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string | null,
  ministry?: string | null,
  provider?: string | null,
  userEmail?: string | null, // Non admins will be required to pass this field that will filter projects for thier user
): Promise<{
  data: Project[];
  total: number;
}> {
  // Initialize the search/filter query
  const searchQuery: any = {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
    status: 'ACTIVE',
=======
    status: "ACTIVE",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
  };

  // Construct search/filter conditions based on provided parameters
  if (searchTerm) {
    searchQuery.$or = [
      { 'projectOwnerDetails.email': { $regex: searchTerm, $options: 'i' } },
      {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
        'projectOwnerDetails.firstName': { $regex: searchTerm, $options: 'i' },
=======
        "projectOwnerDetails.firstName": { $regex: searchTerm, $options: "i" },
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
      },
      { 'projectOwnerDetails.lastName': { $regex: searchTerm, $options: 'i' } },
      {
        'primaryTechnicalLeadDetails.email': {
          $regex: searchTerm,
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          $options: 'i',
=======
          $options: "i",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      {
        'primaryTechnicalLeadDetails.firstName': {
          $regex: searchTerm,
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          $options: 'i',
=======
          $options: "i",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      {
        'primaryTechnicalLeadDetails.lastName': {
          $regex: searchTerm,
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          $options: 'i',
=======
          $options: "i",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      {
        'secondaryTechnicalLeadDetails.email': {
          $regex: searchTerm,
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          $options: 'i',
=======
          $options: "i",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      {
        'secondaryTechnicalLeadDetails.firstName': {
          $regex: searchTerm,
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          $options: 'i',
=======
          $options: "i",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      {
        'secondaryTechnicalLeadDetails.lastName': {
          $regex: searchTerm,
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          $options: 'i',
        },
      },
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { licencePlate: { $regex: searchTerm, $options: 'i' } },
      { provider: { $regex: searchTerm, $options: 'i' } },
      { ministry: { $regex: searchTerm, $options: 'i' } },
=======
          $options: "i",
        },
      },
      { name: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { licencePlate: { $regex: searchTerm, $options: "i" } },
      { provider: { $regex: searchTerm, $options: "i" } },
      { ministry: { $regex: searchTerm, $options: "i" } },
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts

      // include other fields as necessary
    ];
  }

  if (ministry) {
    searchQuery.ministry = ministry;
  }

  if (provider) {
    searchQuery.provider = provider;
  }

  if (userEmail) {
    searchQuery.$and = [
      {
        $or: [
          { 'projectOwnerDetails.email': { $regex: userEmail, $options: 'i' } },
          {
            'primaryTechnicalLeadDetails.email': {
              $regex: userEmail,
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
              $options: 'i',
=======
              $options: "i",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
            },
          },
          {
            'secondaryTechnicalLeadDetails.email': {
              $regex: userEmail,
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
              $options: 'i',
=======
              $options: "i",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
            },
          },
        ],
      },
    ];
  }

  // First, get the total count of matching documents
  const totalCountResult = await prisma.publicCloudProject.aggregateRaw({
    pipeline: [
      {
        $lookup: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          from: 'User',
          localField: 'projectOwnerId',
          foreignField: '_id',
          as: 'projectOwnerDetails',
=======
          from: "User",
          localField: "projectOwnerId",
          foreignField: "_id",
          as: "projectOwnerDetails",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      {
        $lookup: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          from: 'User',
          localField: 'primaryTechnicalLeadId',
          foreignField: '_id',
          as: 'primaryTechnicalLeadDetails',
=======
          from: "User",
          localField: "primaryTechnicalLeadId",
          foreignField: "_id",
          as: "primaryTechnicalLeadDetails",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      {
        $lookup: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          from: 'User',
          localField: 'secondaryTechnicalLeadId',
          foreignField: '_id',
          as: 'secondaryTechnicalLeadDetails',
        },
      },
      { $match: searchQuery },
      { $unwind: '$projectOwnerDetails' },
      { $count: 'totalCount' },
=======
          from: "User",
          localField: "secondaryTechnicalLeadId",
          foreignField: "_id",
          as: "secondaryTechnicalLeadDetails",
        },
      },
      { $match: searchQuery },
      { $unwind: "$projectOwnerDetails" },
      { $count: "totalCount" },
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
    ],
  });

  // Then, get the actual page of data
  const result = await prisma.publicCloudProject.aggregateRaw({
    pipeline: [
      {
        $lookup: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          from: 'User',
          localField: 'projectOwnerId',
          foreignField: '_id',
          as: 'projectOwnerDetails',
=======
          from: "User",
          localField: "projectOwnerId",
          foreignField: "_id",
          as: "projectOwnerDetails",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      {
        $lookup: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          from: 'User',
          localField: 'primaryTechnicalLeadId',
          foreignField: '_id',
          as: 'primaryTechnicalLeadDetails',
=======
          from: "User",
          localField: "primaryTechnicalLeadId",
          foreignField: "_id",
          as: "primaryTechnicalLeadDetails",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      {
        $lookup: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          from: 'User',
          localField: 'secondaryTechnicalLeadId',
          foreignField: '_id',
          as: 'secondaryTechnicalLeadDetails',
=======
          from: "User",
          localField: "secondaryTechnicalLeadId",
          foreignField: "_id",
          as: "secondaryTechnicalLeadDetails",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      { $match: searchQuery },
      { $unwind: '$projectOwnerDetails' },
      { $unwind: '$primaryTechnicalLeadDetails' },
      {
        $unwind: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          path: '$secondaryTechnicalLeadDetails',
=======
          path: "$secondaryTechnicalLeadDetails",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
          preserveNullAndEmptyArrays: true,
        },
      },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
      {
        $addFields: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          id: { $toString: '$_id' }, // Convert _id to string
=======
          id: { $toString: "$_id" }, // Convert _id to string
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id field from the result
        },
      },
    ],
  });

  // @ts-ignore
  const totalCount = totalCountResult[0]?.totalCount || 0;

  return {
    data: result as unknown as Project[],
    total: totalCount || 0,
  };
}

export async function publicCloudRequestsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string,
  ministry?: string,
  provider?: string,
  userEmail?: string,
  active: boolean = true,
): Promise<{
  data: any[];
  total: number;
}> {
  const searchQuery: any = active ? { active: true } : {};

  if (searchTerm) {
    searchQuery.$or = [
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
      { 'requestedProject.name': { $regex: searchTerm, $options: 'i' } },
      { 'requestedProject.ministry': { $regex: searchTerm, $options: 'i' } },
=======
      { "requestedProject.name": { $regex: searchTerm, $options: "i" } },
      { "requestedProject.ministry": { $regex: searchTerm, $options: "i" } },
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
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
          { 'projectOwner.email': { $regex: userEmail, $options: 'i' } },
          {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
            'primaryTechnicalLead.email': { $regex: userEmail, $options: 'i' },
=======
            "primaryTechnicalLead.email": { $regex: userEmail, $options: "i" },
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
          },
          {
            'secondaryTechnicalLead.email': {
              $regex: userEmail,
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
              $options: 'i',
=======
              $options: "i",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
            },
          },
        ],
      },
    ];
  }

  const totalCountResult = await prisma.publicCloudRequest.aggregateRaw({
    pipeline: [
      {
        $lookup: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          from: 'PublicCloudRequestedProject',
          localField: 'requestedProjectId',
          foreignField: '_id',
          as: 'requestedProject',
=======
          from: "PublicCloudRequestedProject",
          localField: "requestedProjectId",
          foreignField: "_id",
          as: "requestedProject",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      { $unwind: '$requestedProject' },
      {
        $lookup: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          from: 'User',
          localField: 'requestedProject.projectOwnerId',
          foreignField: '_id',
          as: 'projectOwner',
=======
          from: "User",
          localField: "requestedProject.projectOwnerId",
          foreignField: "_id",
          as: "projectOwner",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      { $unwind: '$projectOwner' },
      {
        $lookup: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          from: 'User',
          localField: 'requestedProject.primaryTechnicalLeadId',
          foreignField: '_id',
          as: 'primaryTechnicalLead',
=======
          from: "User",
          localField: "requestedProject.primaryTechnicalLeadId",
          foreignField: "_id",
          as: "primaryTechnicalLead",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      { $unwind: '$primaryTechnicalLead' },
      {
        $lookup: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          from: 'User',
          localField: 'requestedProject.secondaryTechnicalLeadId',
          foreignField: '_id',
          as: 'secondaryTechnicalLead',
=======
          from: "User",
          localField: "requestedProject.secondaryTechnicalLeadId",
          foreignField: "_id",
          as: "secondaryTechnicalLead",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      {
        $unwind: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          path: '$secondaryTechnicalLead',
=======
          path: "$secondaryTechnicalLead",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
          preserveNullAndEmptyArrays: true,
        },
      },
      { $unwind: '$requestedProject' },
      { $match: searchQuery },
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
      { $count: 'totalCount' },
=======
      { $count: "totalCount" },
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
    ],
  });

  const result = await prisma.publicCloudRequest.aggregateRaw({
    pipeline: [
      {
        $lookup: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          from: 'PublicCloudRequestedProject',
          localField: 'requestedProjectId',
          foreignField: '_id',
          as: 'requestedProject',
=======
          from: "PublicCloudRequestedProject",
          localField: "requestedProjectId",
          foreignField: "_id",
          as: "requestedProject",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      { $unwind: '$requestedProject' },
      {
        $lookup: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          from: 'User',
          localField: 'requestedProject.projectOwnerId',
          foreignField: '_id',
          as: 'projectOwner',
=======
          from: "User",
          localField: "requestedProject.projectOwnerId",
          foreignField: "_id",
          as: "projectOwner",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      { $unwind: '$projectOwner' },
      {
        $lookup: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          from: 'User',
          localField: 'requestedProject.primaryTechnicalLeadId',
          foreignField: '_id',
          as: 'primaryTechnicalLead',
=======
          from: "User",
          localField: "requestedProject.primaryTechnicalLeadId",
          foreignField: "_id",
          as: "primaryTechnicalLead",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      { $unwind: '$primaryTechnicalLead' },
      {
        $lookup: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          from: 'User',
          localField: 'requestedProject.secondaryTechnicalLeadId',
          foreignField: '_id',
          as: 'secondaryTechnicalLead',
=======
          from: "User",
          localField: "requestedProject.secondaryTechnicalLeadId",
          foreignField: "_id",
          as: "secondaryTechnicalLead",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
        },
      },
      {
        $unwind: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          path: '$secondaryTechnicalLead',
=======
          path: "$secondaryTechnicalLead",
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: searchQuery },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
      {
        $addFields: {
<<<<<<< HEAD:paginatedQueries/public-cloud/index.ts
          id: { $toString: '$_id' },
=======
          id: { $toString: "$_id" },
>>>>>>> 316df6e (created quereis):paginated-queries/public-cloud/index.ts
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
