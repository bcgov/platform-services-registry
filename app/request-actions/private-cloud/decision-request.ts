import { $Enums, Cluster, DecisionStatus, Prisma, ProjectStatus, RequestType } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { createEvent } from '@/mutations/events';
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
    originalData: {
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
  id: string,
  decision: DecisionStatus,
  decisionComment: string | undefined,
  formData: PrivateCloudEditRequestBody,
  session: Session,
) {
  const request = await prisma.privateCloudRequest.findUnique({
    where: {
      id,
      active: true,
      decisionStatus: $Enums.DecisionStatus.PENDING,
    },
    include: {
      project: { select: { cluster: true } },
      decisionData: { select: { cluster: true } },
    },
  });

  if (!request) {
    return null;
  }

  const dataToUpdate: Prisma.PrivateCloudRequestUpdateInput = {
    active: decision === DecisionStatus.APPROVED,
    decisionStatus: decision,
    decisionComment,
    decisionDate: new Date(),
    decisionMakerEmail: session.user.email,
  };

  // No need to modify decision data when reviewing deletion requests.
  if (request.type !== RequestType.DELETE) {
    dataToUpdate.decisionData = {
      update: {
        ...formData,
        status: ProjectStatus.ACTIVE,
        licencePlate: request.licencePlate,
        cluster: request.project?.cluster ?? request.decisionData.cluster,
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
    };
  }

  const updatedRequest = await prisma.privateCloudRequest.update({
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
        },
      },
    },
    data: dataToUpdate,
  });

  if (updatedRequest) {
    await createEvent($Enums.EventType.REVIEW_PRIVATE_CLOUD_REQUEST, session.user.id, { requestId: updatedRequest.id });
  }

  return updatedRequest;
}
