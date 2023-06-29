import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const privateCloudProjects = async () => {
  return await prisma.privateCloudProject.findMany({
    where: {
      status: "ACTIVE",
    },
  });
};

interface PrivateCloudProject {
  id: string;
  name: string;
  description: string;
  status: string;
  projectOwnerDetails: User;
  primaryTechnicalLeadDetails: User;
  secondaryTechnicalLeadDetails: User;
  // and any other fields that might be relevant
}

interface User {
  email: string;
  firstName: string;
  lastName: string;
  // and any other fields that might be relevant
}

export async function privateCloudProjectsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string,
  ministry?: string,
  cluster?: string
): Promise<{
  data: any[];
  total: number;
}> {
  // Initialize the search/filter query
  const searchQuery: any = {
    status: "ACTIVE",
  };

  // Construct search/filter conditions based on provided parameters
  if (searchTerm) {
    searchQuery.$or = [
      { "projectOwnerDetails.email": { $regex: searchTerm, $options: "i" } },
      {
        "projectOwnerDetails.firstName": { $regex: searchTerm, $options: "i" },
      },
      { "projectOwnerDetails.lastName": { $regex: searchTerm, $options: "i" } },
      {
        "primaryTechnicalLeadDetails.email": {
          $regex: searchTerm,
          $options: "i",
        },
      },
      {
        "primaryTechnicalLeadDetails.firstName": {
          $regex: searchTerm,
          $options: "i",
        },
      },
      {
        "primaryTechnicalLeadDetails.lastName": {
          $regex: searchTerm,
          $options: "i",
        },
      },
      {
        "secondaryTechnicalLeadDetails.email": {
          $regex: searchTerm,
          $options: "i",
        },
      },
      {
        "secondaryTechnicalLeadDetails.firstName": {
          $regex: searchTerm,
          $options: "i",
        },
      },
      {
        "secondaryTechnicalLeadDetails.lastName": {
          $regex: searchTerm,
          $options: "i",
        },
      },
      { name: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { licencePlate: { $regex: searchTerm, $options: "i" } },
      { cluster: { $regex: searchTerm, $options: "i" } },
      { ministry: { $regex: searchTerm, $options: "i" } },

      // include other fields as necessary
    ];
  }

  if (ministry) {
    searchQuery.ministry = ministry;
  }

  if (cluster) {
    searchQuery.cluster = cluster;
  }

  // First, get the total count of matching documents
  const totalCountResult = await prisma.privateCloudProject.aggregateRaw({
    pipeline: [
      {
        $lookup: {
          from: "User",
          localField: "projectOwnerId",
          foreignField: "_id",
          as: "projectOwnerDetails",
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "primaryTechnicalLeadId",
          foreignField: "_id",
          as: "primaryTechnicalLeadDetails",
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "secondaryTechnicalLeadId",
          foreignField: "_id",
          as: "secondaryTechnicalLeadDetails",
        },
      },
      { $match: searchQuery },
      { $unwind: "$projectOwnerDetails" },
      { $count: "totalCount" },
    ],
  });

  // Then, get the actual page of data
  const result = await prisma.privateCloudProject.aggregateRaw({
    pipeline: [
      {
        $lookup: {
          from: "User",
          localField: "projectOwnerId",
          foreignField: "_id",
          as: "projectOwnerDetails",
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "primaryTechnicalLeadId",
          foreignField: "_id",
          as: "primaryTechnicalLeadDetails",
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "secondaryTechnicalLeadId",
          foreignField: "_id",
          as: "secondaryTechnicalLeadDetails",
        },
      },
      { $match: searchQuery },
      { $unwind: "$projectOwnerDetails" },
      { $unwind: "$primaryTechnicalLeadDetails" },
      { $unwind: "$secondaryTechnicalLeadDetails" },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
      {
        $addFields: {
          id: { $toString: "$_id" }, // Convert _id to string
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
    data: result as unknown as any[],
    total: totalCount || 0,
  };
}

export async function publicCloudProjectsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string,
  ministry?: string,
  cluster?: string
): Promise<{
  data: any[];
  total: number;
}> {
  const projects = await prisma.publicCloudProject.findMany();
  return {
    data: projects,
    total: projects.length,
  };
}
