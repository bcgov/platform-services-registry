import { $Enums, DecisionStatus, Prisma, ProjectStatus } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { createEvent } from '@/mutations/events';
import { PublicCloudEditRequestBody } from '@/schema';

export type PublicCloudRequestWithProjectAndRequestedProject = Prisma.PublicCloudRequestGetPayload<{
  include: {
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
  };
}>;

export type PublicCloudRequestWithRequestedProject = Prisma.PublicCloudRequestGetPayload<{
  include: {
    decisionData: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
  };
}>;

export default async function makeRequestDecision(
  id: string,
  decision: DecisionStatus,
  decisionComment: string | undefined,
  formData: PublicCloudEditRequestBody,
  session: Session,
): Promise<PublicCloudRequestWithProjectAndRequestedProject> {
  const request = await prisma.publicCloudRequest.findUnique({
    where: {
      id,
      active: true,
    },
    select: { id: true, licencePlate: true },
  });

  if (!request) {
    throw new Error('Request not found.');
  }

  const updatedRequest = await prisma.publicCloudRequest.update({
    where: {
      id: request.id,
      active: true,
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
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
    },
    data: {
      active: decision === DecisionStatus.APPROVED,
      decisionStatus: decision,
      decisionComment,
      decisionDate: new Date(),
      decisionMakerEmail: session.user.email,
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
        },
      },
    },
  });

  if (updatedRequest) {
    await createEvent($Enums.EventType.REVIEW_PUBLIC_CLOUD_REQUEST, session.user.id, { requestId: updatedRequest.id });
  }

  return updatedRequest;
}
