import { PrismaClient } from "@prisma/client";
import { ObjectId } from "bson";
import prisma from "@/lib/prisma";

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

export async function publicCloudProjectsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string,
  ministry?: string,
  provider?: string,
  userId?: string
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
      { provider: { $regex: searchTerm, $options: "i" } },
      { ministry: { $regex: searchTerm, $options: "i" } },

      // include other fields as necessary
    ];
  }

  if (ministry) {
    searchQuery.ministry = ministry;
  }

  if (provider) {
    searchQuery.provider = provider;
  }

  if (userId) {
    searchQuery.$or = searchQuery.$or || [];
    searchQuery.$or.push(
      { projectOwnerId: userId },
      { primaryTechnicalLeadId: userId },
      { secondaryTechnicalLeadId: userId }
    );
  }

  // First, get the total count of matching documents
  const totalCountResult = await prisma.publicCloudProject.aggregateRaw({
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
  const result = await prisma.publicCloudProject.aggregateRaw({
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

export async function publicCloudRequestsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string,
  ministry?: string,
  provider?: string,
  userId?: string
): Promise<{
  data: any[];
  total: number;
}> {
  const searchQuery: any = {
    status: "ACTIVE",
  };

  if (searchTerm) {
    searchQuery.$or = [
      { "requesterDetails.email": { $regex: searchTerm, $options: "i" } },
      { "requesterDetails.firstName": { $regex: searchTerm, $options: "i" } },
      { "requesterDetails.lastName": { $regex: searchTerm, $options: "i" } },
      { "provider.name": { $regex: searchTerm, $options: "i" } },
      { "ministry.name": { $regex: searchTerm, $options: "i" } },
      { name: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (ministry) {
    searchQuery["ministry.name"] = ministry;
  }

  if (provider) {
    searchQuery["provider.name"] = provider;
  }

  if (userId) {
    searchQuery.$or = searchQuery.$or || [];
    searchQuery.$or.push({ requesterId: userId });
  }

  const totalCountResult = await prisma.publicCloudRequest.aggregateRaw({
    pipeline: [
      {
        $lookup: {
          from: "User",
          localField: "requesterId",
          foreignField: "_id",
          as: "requesterDetails",
        },
      },
      {
        $lookup: {
          from: "Provider",
          localField: "providerId",
          foreignField: "_id",
          as: "provider",
        },
      },
      {
        $lookup: {
          from: "Ministry",
          localField: "ministryId",
          foreignField: "_id",
          as: "ministry",
        },
      },
      { $match: searchQuery },
      { $unwind: "$requesterDetails" },
      { $unwind: "$provider" },
      { $unwind: "$ministry" },
      { $count: "totalCount" },
    ],
  });

  const result = await prisma.publicCloudRequest.aggregateRaw({
    pipeline: [
      {
        $lookup: {
          from: "User",
          localField: "requesterId",
          foreignField: "_id",
          as: "requesterDetails",
        },
      },
      {
        $lookup: {
          from: "Provider",
          localField: "providerId",
          foreignField: "_id",
          as: "provider",
        },
      },
      {
        $lookup: {
          from: "Ministry",
          localField: "ministryId",
          foreignField: "_id",
          as: "ministry",
        },
      },
      { $match: searchQuery },
      { $unwind: "$requesterDetails" },
      { $unwind: "$provider" },
      { $unwind: "$ministry" },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
      {
        $addFields: {
          id: { $toString: "$_id" },
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
    data: result as unknown as any[],
    total: totalCount || 0,
  };
}

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
  cluster: string;
  ministry: string;
  status: string;
  projectOwnerId: string;
  primaryTechnicalLeadId: string;
  secondaryTechnicalLeadId: string;
  projectOwnerDetails: ProjectOwnerDetails;
  primaryTechnicalLeadDetails: ProjectOwnerDetails;
  secondaryTechnicalLeadDetails: ProjectOwnerDetails;
}

export async function privateCloudProjectsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string | null,
  ministry?: string | null,
  cluster?: string | null,
  userEmail?: string | null // Non admins will be required to pass this field that will filter projects for thier user
): Promise<{
  data: Project[];
  total: number;
}> {
  let userId: string | undefined = undefined;

  if (userEmail) {
    const user = await prisma.user.findFirst({
      where: {
        email: userEmail,
      },
    });

    if (user) {
      userId = user.id;
    }
  }

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

  if (userId) {
    searchQuery.$or = searchQuery.$or || [];
    searchQuery.$or.push(
      { projectOwnerId: userId },
      { primaryTechnicalLeadId: userId },
      { secondaryTechnicalLeadId: userId }
    );
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
      {
        $unwind: {
          path: "$secondaryTechnicalLeadDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
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
    data: result as unknown as Project[],
    total: totalCount || 0,
  };
}

export async function privateCloudRequestsPaginated(
  pageSize: number,
  pageNumber: number,
  searchTerm?: string | null,
  ministry?: string | null,
  cluster?: string | null,
  userId?: string | null
): Promise<{
  data: any[];
  total: number;
}> {
  const searchQuery: any = {
    active: true,
  };

  if (searchTerm) {
    searchQuery.$or = [
      { "requestedProject.name": { $regex: searchTerm, $options: "i" } },
      { "requestedProject.ministry": { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (ministry) {
    searchQuery["requestedProject.ministry"] = ministry;
  }

  if (cluster) {
    searchQuery["requestedProject.cluster"] = cluster;
  }

  if (userId) {
    searchQuery.$or = [
      { "requestedProject.projectOwnerId": userId },
      { "requestedProject.teamMemberIds": userId },
    ];
  }

  const totalCountResult = await prisma.privateCloudRequest.aggregateRaw({
    pipeline: [
      {
        $lookup: {
          from: "PrivateCloudRequestedProject",
          localField: "requestedProjectId",
          foreignField: "_id",
          as: "requestedProject",
        },
      },
      { $unwind: "$requestedProject" },
      { $match: searchQuery },
      { $count: "totalCount" },
    ],
  });

  const result = await prisma.privateCloudRequest.aggregateRaw({
    pipeline: [
      {
        $lookup: {
          from: "PrivateCloudRequestedProject",
          localField: "requestedProjectId",
          foreignField: "_id",
          as: "requestedProject",
        },
      },
      { $unwind: "$requestedProject" },
      {
        $lookup: {
          from: "User",
          localField: "requestedProject.projectOwnerId",
          foreignField: "_id",
          as: "projectOwner",
        },
      },
      { $unwind: "$projectOwner" },
      {
        $lookup: {
          from: "User",
          localField: "requestedProject.primaryTechnicalLeadId",
          foreignField: "_id",
          as: "primaryTechnicalLead",
        },
      },
      { $unwind: "$primaryTechnicalLead" },
      {
        $lookup: {
          from: "User",
          localField: "requestedProject.secondaryTechnicalLeadId",
          foreignField: "_id",
          as: "secondaryTechnicalLead",
        },
      },
      {
        $unwind: {
          path: "$secondaryTechnicalLead",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: searchQuery },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
      {
        $addFields: {
          id: { $toString: "$_id" },
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
