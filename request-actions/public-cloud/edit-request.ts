import { DecisionStatus, RequestType } from '@prisma/client';
import prisma from '@/core/prisma';
import { PublicCloudEditRequestBody } from '@/schema';
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
    created: project.created,
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

  const originalData = {
    name: project.name,
    description: project.description,
    provider: project.provider,
    ministry: project.ministry,
    status: project.status,
    licencePlate: project.licencePlate,
    created: project.created,
    accountCoding: project.accountCoding,
    budget: project.budget,
    projectOwner: {
      connectOrCreate: {
        where: {
          email: project.projectOwner.email,
        },
        create: project.projectOwner,
      },
    },
    primaryTechnicalLead: {
      connectOrCreate: {
        where: {
          email: project.primaryTechnicalLead.email,
        },
        create: project.primaryTechnicalLead,
      },
    },
    secondaryTechnicalLead: project.secondaryTechnicalLead
      ? {
          connectOrCreate: {
            where: {
              email: project.secondaryTechnicalLead.email,
            },
            create: project.secondaryTechnicalLead,
          },
        }
      : undefined,
    expenseAuthority: project.expenseAuthority
      ? // this check until expenseAuthority field will be populated for every public cloud product
        {
          connectOrCreate: {
            where: {
              email: project.expenseAuthority.email,
            },
            create: project.expenseAuthority,
          },
        }
      : undefined,
  };

  console.log('decisionData', decisionData);
  return prisma.publicCloudRequest.create({
    data: {
      type: RequestType.EDIT,
      decisionStatus: DecisionStatus.APPROVED, // automatically approve edit requests for public cloud
      active: true,
      createdByEmail: authEmail,
      licencePlate: project.licencePlate,
      requestComment,
      originalData: {
        create: originalData,
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
