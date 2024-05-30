import { $Enums, DecisionStatus, Prisma, RequestType } from '@prisma/client';
import prisma from '@/core/prisma';
import { PublicCloudEditRequestBody, UserInput } from '@/schema';
import { upsertUsers } from '@/services/db/user';

export default async function editRequest(
  licencePlate: string,
  formData: PublicCloudEditRequestBody,
  authEmail: string,
) {
  // Get the current project that we are creating an edit request for
  const project = await prisma.publicCloudProject.findUnique({
    where: {
      licencePlate: licencePlate,
    },
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
    },
  });

  if (!project) {
    throw new Error('Project does not exist.');
  }

  const { requestComment, ...rest } = formData;

  await upsertUsers([
    formData.projectOwner.email,
    formData.primaryTechnicalLead.email,
    formData.secondaryTechnicalLead?.email,
  ]);

  // Merge the form data with the existing project data
  const decisionData = {
    ...rest,
    licencePlate: project.licencePlate,
    status: project.status,
    createdAt: project.createdAt,
    projectOwner: {
      connectOrCreate: {
        where: {
          email: formData.projectOwner.email,
        },
        create: formData.projectOwner,
      },
    },
    primaryTechnicalLead: {
      connectOrCreate: {
        where: {
          email: formData.primaryTechnicalLead.email,
        },
        create: formData.primaryTechnicalLead,
      },
    },
    secondaryTechnicalLead: formData.secondaryTechnicalLead
      ? {
          connectOrCreate: {
            where: {
              email: formData.secondaryTechnicalLead.email,
            },
            create: formData.secondaryTechnicalLead,
          },
        }
      : undefined,
    expenseAuthority: formData.expenseAuthority
      ? // this check until expenseAuthority field will be populated for every public cloud product
        {
          connectOrCreate: {
            where: {
              email: formData.expenseAuthority.email,
            },
            create: formData.expenseAuthority,
          },
        }
      : undefined,
  };

  // Retrieve the latest request data to acquire the decision data ID that can be assigned to the incoming request's original data.
  const previousRequest = await prisma.publicCloudRequest.findFirst({
    where: {
      licencePlate: project.licencePlate,
      active: false,
    },
    select: {
      decisionDataId: true,
    },
    orderBy: {
      updatedAt: Prisma.SortOrder.desc,
    },
  });

  return prisma.publicCloudRequest.create({
    data: {
      type: RequestType.EDIT,
      decisionStatus: DecisionStatus.APPROVED, // automatically approve edit requests for public cloud
      active: true,
      createdByEmail: authEmail,
      licencePlate: project.licencePlate,
      requestComment,
      originalData: {
        connect: {
          id: previousRequest?.decisionDataId,
        },
      },
      decisionData: {
        create: decisionData,
      },
      requestData: {
        create: decisionData,
      },
      project: {
        connect: {
          licencePlate: licencePlate,
        },
      },
    },
    include: {
      project: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
      originalData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
    },
  });
}
