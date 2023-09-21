import {
  ProjectStatus,
  RequestType,
  DecisionStatus,
  DefaultCpuOptions,
  DefaultMemoryOptions,
  DefaultStorageOptions,
  PrivateCloudRequest,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import generateLicensePlate from "@/lib/generateLicencePlate";
import {
  CreateRequestBodySchema,
  CreateRequestBody,
  EditRequestBody,
  UserInput,
} from "@/schema";
import { checkObjectEquality } from "@/lib/isProjectEqual";

const defaultQuota = {
  cpu: DefaultCpuOptions.CPU_REQUEST_0_5_LIMIT_1_5,
  memory: DefaultMemoryOptions.MEMORY_REQUEST_2_LIMIT_4,
  storage: DefaultStorageOptions.STORAGE_1,
};

export default async function decision(
  requestId: string,
  decision: DecisionStatus,
  formData: EditRequestBody,
  comment: string,
  authEmail: string
): Promise<PrivateCloudRequest> {
  // Get the request that we are making a decision on
  const request = await prisma.privateCloudRequest.findUnique({
    where: {
      id: requestId,
    },
    include: {
      project: true,
      requestedProject: {
        include: {
          projectOwner: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              ministry: true,
            },
          },
          primaryTechnicalLead: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              ministry: true,
            },
          },
          secondaryTechnicalLead: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              ministry: true,
            },
          },
        },
      },
    },
  });

  if (!request) {
    throw new Error("Request not found.");
  }

  prisma.privateCloudRequest.update({
    where: {
      id: requestId,
      decisionStatus: DecisionStatus.PENDING,
    }, 
    data: {
      decisionStatus: decision,
      humanComment: "comment",
    }
  })
      


  // const requestedProject = {
  //   ...formData,
  //   licencePlate: project.licencePlate,
  //   status: project.status,
  //   cluster: project.cluster,
  //   created: project.created,
  //   projectOwner: {
  //     connectOrCreate: {
  //       where: {
  //         email: formData.projectOwner.email,
  //       },
  //       create: formData.projectOwner,
  //     },
  //   },
  //   primaryTechnicalLead: {
  //     connectOrCreate: {
  //       where: {
  //         email: formData.primaryTechnicalLead.email,
  //       },
  //       create: formData.primaryTechnicalLead,
  //     },
  //   },
  //   secondaryTechnicalLead: formData.secondaryTechnicalLead
  //     ? {
  //         connectOrCreate: {
  //           where: {
  //             email: formData.secondaryTechnicalLead.email,
  //           },
  //           create: formData.secondaryTechnicalLead,
  //         },
  //       }
  //     : undefined,
  // };

  // If the admin has made a change to the requested project, update the requested project
  if (!isRequestedProjectAndFormDataEqual) {
    const requestedProjectDataFromForm = {
      ...rest,
      projectOwner: {
        connectOrCreate: {
          where: {
            email: projectOwner.email,
          },
          create: projectOwner,
        },
      },
      primaryTechnicalLead: {
        connectOrCreate: {
          where: {
            email: primaryTechnicalLead.email,
          },
          create: primaryTechnicalLead,
        },
      },
      secondaryTechnicalLead: secondaryTechnicalLead
        ? {
            connectOrCreate: {
              where: {
                email: secondaryTechnicalLead.email,
              },
              create: secondaryTechnicalLead,
            },
          }
        : undefined,
    };
  }
}
