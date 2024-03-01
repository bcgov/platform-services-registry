import { DecisionStatus, Prisma, ProjectStatus, PublicCloudRequest, RequestType } from '@prisma/client';
import prisma from '@/core/prisma';
import generateLicensePlate from '@/helpers/license-plate';
import { PublicCloudCreateRequestBody } from '@/schema';

export type PublicCloudRequestWithProjectAndRequestedProject = Prisma.PublicCloudRequestGetPayload<{
  include: {
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    requestedProject: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
  };
}>;

export default async function createRequest(
  formData: PublicCloudCreateRequestBody,
  authEmail: string,
): Promise<PublicCloudRequestWithProjectAndRequestedProject> {
  const licencePlate = generateLicensePlate();

  const createRequestedProject: Prisma.PublicCloudRequestedProjectCreateInput = {
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
        },
      },
      requestedProject: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
    },
  });
}
