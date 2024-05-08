import { Cluster, DecisionStatus, Prisma, ProjectStatus } from '@prisma/client';
import prisma from '@/core/prisma';
import { PrivateCloudEditRequestBody } from '@/schema';

export type PrivateCloudRequestWithRequestedProject = Prisma.PrivateCloudRequestGetPayload<{
  include: {
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
  };
}>;

export type PrivateCloudRequestWithProjectAndRequestedProject = Prisma.PrivateCloudRequestGetPayload<{
  include: {
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
  };
}>;

export default async function makeRequestDecision(
  licencePlate: string,
  decision: DecisionStatus,
  comment: string | undefined,
  formData: PrivateCloudEditRequestBody,
  authEmail: string,
) {
  const request = await prisma.privateCloudRequest.findFirst({
    where: {
      licencePlate,
      active: true,
    },
    select: { id: true, licencePlate: true },
  });

  if (!request) {
    throw new Error('Request not found.');
  }

  const updatedProduct = await prisma.privateCloudRequest.update({
    where: {
      id: request.id,
    },
    include: {
      project: {
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
        },
      },
    },
    data: {
      active: decision === DecisionStatus.APPROVED,
      decisionStatus: decision,
      decisionComment: comment,
      decisionDate: new Date(),
      decisionMakerEmail: authEmail,
      decisionData: {
        update: {
          ...formData,
          status: ProjectStatus.ACTIVE,
          licencePlate: request.licencePlate,
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
        },
      },
    },
  });

  return updatedProduct as PrivateCloudRequestWithProjectAndRequestedProject;
}
