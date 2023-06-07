import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const privateCloudProjects = async () => {
  return await prisma.privateCloudProject.findMany({
    where: {
      status: "ACTIVE"
    }
  });
};

export const privateCloudProjectById = async (projectId: string) =>
  await prisma.privateCloudProject.findUnique({
    where: {
      id: projectId,
      status: "ACTIVE"
    }
  });

export const userPrivateCloudProjects = async (authEmail: string) =>
  await prisma.privateCloudProject.findMany({
    orderBy: {
      name: "asc"
    },
    where: {
      status: "ACTIVE",
      OR: [
        { projectOwner: { email: authEmail } },
        { primaryTechnicalLead: { email: authEmail } },
        { secondaryTechnicalLead: { email: authEmail } }
      ]
    }
  });

export const userPrivateCloudProjectById = async (
  projectId: string,
  authEmail: string
) =>
  await prisma.privateCloudProject.findUnique({
    where: {
      id: projectId,
      status: "ACTIVE",
      OR: [
        { projectOwner: { email: authEmail } },
        { primaryTechnicalLead: { email: authEmail } },
        { secondaryTechnicalLead: { email: authEmail } }
      ]
    }
  });

export const userPrivateCloudProjectsByIds = async (
  projectIds: string[],
  authEmail: string
) =>
  await prisma.privateCloudProject.findMany({
    where: {
      id: { in: projectIds },
      status: "ACTIVE",
      OR: [
        { projectOwner: { email: authEmail } },
        { primaryTechnicalLead: { email: authEmail } },
        { secondaryTechnicalLead: { email: authEmail } }
      ]
    }
  });

export const privateCloudProjectsPaginated = async (
  search: string | null | undefined,
  filter: {
    ministry: string | null | undefined;
    cluster: string | null | undefined;
  } = { ministry: null, cluster: null },
  page: number,
  pageSize: number,
  sortOrder = -1,
  userId = ""
) => {
  let { ministry, cluster } = filter;

  search = !search ? undefined : search.toLowerCase();
  ministry = !ministry ? undefined : ministry;
  cluster = !cluster ? undefined : cluster;

  const offset = page > 0 ? (page - 1) * pageSize : 0;

  const projects = await prisma.privateCloudProject.aggregateRaw({
    pipeline: [
      {
        $project: {
          id: {
            $toString: "$_id"
          },
          name: 1,
          licencePlate: 1,
          archived: 1,
          created: {
            $toString: "$created"
          },
          description: 1,
          status: 1,
          projectOwnerId: {
            $toString: "$projectOwnerId"
          },
          secondaryTechnicalLeadId: {
            $toString: "$secondaryTechnicalLeadId"
          },
          primaryTechnicalLeadId: {
            $toString: "$primaryTechnicalLeadId"
          },
          projectOwnerIdSearch: {
            $toObjectId: "$projectOwnerId"
          },
          primaryTechnicalLeadIdSearch: {
            $toObjectId: "$primaryTechnicalLeadId"
          },
          secondaryTechnicalLeadIdSearch: {
            $toObjectId: "$secondaryTechnicalLeadId"
          },
          ministry: 1,
          cluster: 1,
          productionQuota: 1,
          testQuota: 1,
          developmentQuota: 1,
          toolsQuota: 1,
          requestHistory: 1,
          activeEditRequest: 1,
          count: 1,
          commonComponents: 1,
          lowerDescription: {
            $toLower: "$description"
          },
          lowerName: {
            $toLower: "$name"
          }
        }
      },
      {
        $lookup: {
          from: "User",
          localField: "projectOwnerIdSearch",
          foreignField: "_id",
          as: "projectOwner"
        }
      },
      {
        $unwind: {
          path: "$projectOwner"
        }
      },
      {
        $lookup: {
          from: "User",
          localField: "secondaryTechnicalLeadIdSearch",
          foreignField: "_id",
          as: "secondaryTechnicalLead"
        }
      },
      {
        $unwind: {
          path: "$secondaryTechnicalLead",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "User",
          localField: "primaryTechnicalLeadIdSearch",
          foreignField: "_id",
          as: "primaryTechnicalLead"
        }
      },
      {
        $unwind: {
          path: "$primaryTechnicalLead",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          projectOwnerEmail: { $toLower: "$projectOwner.email" },
          projectOwnerName: {
            $concat: [
              { $toLower: "$projectOwner.firstName" },
              " ",
              { $toLower: "$projectOwner.lastName" }
            ]
          },
          primaryTechnicalLeadEmail: {
            $toLower: "$primaryTechnicalLead.email"
          },
          primaryTechnicalLeadName: {
            $concat: [
              { $toLower: "$primaryTechnicalLead.firstName" },
              " ",
              { $toLower: "$primaryTechnicalLead.lastName" }
            ]
          },
          secondaryTechnicalLeadName: {
            $concat: [
              { $toLower: "$secondaryTechnicalLead.firstName" },
              " ",
              { $toLower: "$secondaryTechnicalLead.lastName" }
            ]
          },
          secondaryTechnicalLeadEmail: {
            $toLower: "$secondaryTechnicalLead.email"
          }
        }
      },
      {
        $match: {
          status: { $regex: "ACTIVE" },
          $and: [
            {
              $or: [
                { projectOwnerId: { $regex: userId } },
                { primaryTechnicalLeadId: { $regex: userId } },
                { secondaryTechnicalLeadId: { $regex: userId } }
              ]
            },
            {
              cluster: cluster,
              ministry: ministry,
              $or: [
                {
                  projectOwnerEmail: { $regex: search ? search : "" }
                },
                {
                  projectOwnerName: { $regex: search ? search : "" }
                },
                {
                  primaryTechnicalLeadEmail: { $regex: search ? search : "" }
                },
                {
                  primaryTechnicalLeadName: { $regex: search ? search : "" }
                },
                {
                  secondaryTechnicalLeadEmail: { $regex: search ? search : "" }
                },
                {
                  secondaryTechnicalLeadName: { $regex: search ? search : "" }
                },
                {
                  lowerName: { $regex: search ? search : "" }
                },
                {
                  lowerDescription: { $regex: search ? search : "" }
                },
                {
                  licencePlate: { $regex: search ? search : "" }
                }
              ]
            }
          ]
        }
      },
      {
        $sort: { lowerName: sortOrder }
      },
      {
        $skip: offset
      },
      {
        $limit: pageSize
      }
    ]
  });

  const totalTmp = await prisma.privateCloudProject.aggregateRaw({
    pipeline: [
      {
        $project: {
          id: {
            $toString: "$_id"
          },
          name: 1,
          licencePlate: 1,
          archived: 1,
          created: {
            $toString: "$created"
          },
          description: 1,
          status: 1,
          projectOwnerId: {
            $toString: "$projectOwnerId"
          },
          secondaryTechnicalLeadId: {
            $toString: "$secondaryTechnicalLeadId"
          },
          primaryTechnicalLeadId: {
            $toString: "$primaryTechnicalLeadId"
          },
          projectOwnerIdSearch: {
            $toObjectId: "$projectOwnerId"
          },
          primaryTechnicalLeadIdSearch: {
            $toObjectId: "$primaryTechnicalLeadId"
          },
          secondaryTechnicalLeadIdSearch: {
            $toObjectId: "$secondaryTechnicalLeadId"
          },
          ministry: 1,
          cluster: 1,
          productionQuota: 1,
          testQuota: 1,
          developmentQuota: 1,
          toolsQuota: 1,
          requestHistory: 1,
          activeEditRequest: 1,
          count: 1,
          commonComponents: 1,
          lowerDescription: {
            $toLower: "$description"
          },
          lowerName: {
            $toLower: "$name"
          }
        }
      },
      {
        $lookup: {
          from: "User",
          localField: "projectOwnerIdSearch",
          foreignField: "_id",
          as: "projectOwner"
        }
      },
      {
        $unwind: {
          path: "$projectOwner"
        }
      },
      {
        $lookup: {
          from: "User",
          localField: "secondaryTechnicalLeadIdSearch",
          foreignField: "_id",
          as: "secondaryTechnicalLead"
        }
      },
      {
        $unwind: {
          path: "$secondaryTechnicalLead",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "User",
          localField: "primaryTechnicalLeadIdSearch",
          foreignField: "_id",
          as: "primaryTechnicalLead"
        }
      },
      {
        $unwind: {
          path: "$primaryTechnicalLead",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          projectOwnerEmail: { $toLower: "$projectOwner.email" },
          projectOwnerName: {
            $concat: [
              { $toLower: "$projectOwner.firstName" },
              " ",
              { $toLower: "$projectOwner.lastName" }
            ]
          },
          primaryTechnicalLeadEmail: {
            $toLower: "$primaryTechnicalLead.email"
          },
          primaryTechnicalLeadName: {
            $concat: [
              { $toLower: "$primaryTechnicalLead.firstName" },
              " ",
              { $toLower: "$primaryTechnicalLead.lastName" }
            ]
          },
          secondaryTechnicalLeadName: {
            $concat: [
              { $toLower: "$secondaryTechnicalLead.firstName" },
              " ",
              { $toLower: "$secondaryTechnicalLead.lastName" }
            ]
          },
          secondaryTechnicalLeadEmail: {
            $toLower: "$secondaryTechnicalLead.email"
          }
        }
      },
      {
        $match: {
          status: { $regex: "ACTIVE" },
          $and: [
            {
              $or: [
                { projectOwnerId: { $regex: userId } },
                { primaryTechnicalLeadId: { $regex: userId } },
                { secondaryTechnicalLeadId: { $regex: userId } }
              ]
            },
            {
              cluster: cluster,
              ministry: ministry,
              $or: [
                {
                  projectOwnerEmail: { $regex: search ? search : "" }
                },
                {
                  projectOwnerName: { $regex: search ? search : "" }
                },
                {
                  primaryTechnicalLeadEmail: { $regex: search ? search : "" }
                },
                {
                  primaryTechnicalLeadName: { $regex: search ? search : "" }
                },
                {
                  secondaryTechnicalLeadEmail: { $regex: search ? search : "" }
                },
                {
                  secondaryTechnicalLeadName: { $regex: search ? search : "" }
                },
                {
                  lowerName: { $regex: search ? search : "" }
                },
                {
                  lowerDescription: { $regex: search ? search : "" }
                },
                {
                  licencePlate: { $regex: search ? search : "" }
                }
              ]
            }
          ]
        }
      },
      {
        $count: "count"
      }
    ]
  });

  // @ts-ignore
  const total = totalTmp.length > 0 ? totalTmp[0]?.count : 0;

  return {
    projects,
    total
  };
};

// export const privateCloudProjectsWithFilterSearch = async (
//   search: string | null | undefined,
//   filter: {
//     ministry: string | null | undefined;
//     cluster: string | null | undefined;
//   } = { ministry: null, cluster: null }
// ) => {
//   let { ministry, cluster } = filter;

//   search = !search ? undefined : search.toLowerCase();
//   ministry = !ministry ? undefined : ministry;
//   cluster = !cluster ? undefined : cluster;

//   const projects = await prisma.privateCloudProject.findMany({
//     orderBy: {
//       name: "asc"
//     },
//     where: {
//       status: "ACTIVE",
//       AND: [
//         {
//           OR: [
//             { projectOwner: { email: { contains: search } } },
//             { projectOwner: { firstName: { contains: search } } },
//             { projectOwner: { lastName: { contains: search } } },
//             { primaryTechnicalLead: { email: { contains: search } } },
//             { primaryTechnicalLead: { firstName: { contains: search } } },
//             { primaryTechnicalLead: { lastName: { contains: search } } },
//             { secondaryTechnicalLead: { email: { contains: search } } },
//             { secondaryTechnicalLead: { firstName: { contains: search } } },
//             { secondaryTechnicalLead: { lastName: { contains: search } } },
//             { name: { contains: search } },
//             { description: { contains: search } },
//             { licencePlate: { contains: search } }
//           ]
//         },
//         {
//           ministry: {
//             in: ministry
//           }
//         },
//         {
//           cluster: {
//             in: cluster
//           }
//         }
//       ]
//     }
//   });

//   return projects;
// };
