import { DecisionStatus, ProjectStatus, RequestType } from '@prisma/client';
import prisma from '@/core/prisma';
import generateLicensePlate from '@/helpers/license-plate';
import { PublicCloudCreateRequestBody } from '@/schema';
import { upsertUsers } from '@/services/db/user';

export default async function createRequest(formData: PublicCloudCreateRequestBody, authEmail: string) {
  const licencePlate = generateLicensePlate();

  await upsertUsers([
    formData.projectOwner.email,
    formData.primaryTechnicalLead.email,
    formData.secondaryTechnicalLead?.email,
  ]);

  const createRequestedProject = {
    name: formData.name,
    accountCoding: formData.accountCoding,
    budget: formData.budget,
    provider: formData.provider,
    description: formData.description,
    ministry: formData.ministry,
    status: ProjectStatus.ACTIVE,
    licencePlate: licencePlate,
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
    expenseAuthority: formData.expenseAuthority // this check until expenseAuthority go live
      ? {
          connectOrCreate: {
            where: {
              email: formData.expenseAuthority.email,
            },
            create: formData.expenseAuthority,
          },
        }
      : undefined,
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
  };

  return prisma.publicCloudRequest.create({
    data: {
      type: RequestType.CREATE,
      decisionStatus: DecisionStatus.PENDING,
      active: true,
      createdByEmail: authEmail,
      licencePlate,
      requestedProject: {
        create: createRequestedProject,
      },
      userRequestedProject: {
        create: createRequestedProject,
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
      requestedProject: {
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
