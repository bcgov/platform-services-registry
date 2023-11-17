import prisma from '@/lib/prisma';
import { PublicProject } from '@/queries/types';
import { userInfo } from '@/queries/user';

export async function publicCloudProjectsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string | null,
  ministry?: string | null,
  provider?: string | null,
): Promise<{
  data: PublicProject[];
  total: number;
}> {
  // Initialize the search/filter query
  const searchQuery: any = {
    status: 'ACTIVE',
  };

  const user = await userInfo();

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
      { provider: { $regex: searchTerm, $options: 'i' } },
      { ministry: { $regex: searchTerm, $options: 'i' } },

      // include other fields as necessary
    ];
  }

  if (ministry) {
    searchQuery.ministry = ministry;
  }

  if (provider) {
    searchQuery.provider = provider;
  }

  if (user?.userEmail) {
    searchQuery.$and = [
      {
        $or: [
          {
            'projectOwnerDetails.email': {
              $regex: user?.userEmail,
              $options: 'i',
            },
          },
          {
            'primaryTechnicalLeadDetails.email': {
              $regex: user?.userEmail,
              $options: 'i',
            },
          },
          {
            'secondaryTechnicalLeadDetails.email': {
              $regex: user?.userEmail,
              $options: 'i',
            },
          },
          {
            ministry: { $in: user?.ministryRole },
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

  // Then, get the actual page of data
  const result = await prisma.publicCloudProject.aggregateRaw({
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
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
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

  // @ts-ignore
  const totalCount = totalCountResult[0]?.totalCount || 0;

  return user
    ? {
        data: result as unknown as PublicProject[],
        total: totalCount || 0,
      }
    : {
        data: [],
        total: 0,
      };
}

export async function publicCloudRequestsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string,
  ministry?: string,
  provider?: string,
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

  if (provider) {
    searchQuery['requestedProject.provider'] = provider;
  }

  if (user?.userEmail) {
    searchQuery.$and = [
      {
        $or: [
          {
            'projectOwner.email': {
              $regex: user?.userEmail,
              $options: 'i',
            },
          },
          {
            'primaryTechnicalLead.email': {
              $regex: user?.userEmail,
              $options: 'i',
            },
          },
          {
            'secondaryTechnicalLead.email': {
              $regex: user?.userEmail,
              $options: 'i',
            },
          },
          {
            ministry: { $in: user?.ministryRole },
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

  return user
    ? {
        data: result as any,
        total: totalCount,
      }
    : {
        data: [],
        total: 0,
      };
}
