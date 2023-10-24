import prisma from "@/lib/prisma";

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

export async function privateCloudProjects(
  searchTerm?: string | null,
  ministry?: string | null,
  cluster?: string | null,
  userEmail?: string | null, // Non admins will be required to pass this field that will filter projects for thier user
): Promise<any> {
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

  if (userEmail) {
    searchQuery.$and = [
      {
        $or: [
          { "projectOwnerDetails.email": { $regex: userEmail, $options: "i" } },
          {
            "primaryTechnicalLeadDetails.email": {
              $regex: userEmail,
              $options: "i",
            },
          },
          {
            "secondaryTechnicalLeadDetails.email": {
              $regex: userEmail,
              $options: "i",
            },
          },
        ],
      },
    ];
  }

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

  return result as unknown as Project[];
}
