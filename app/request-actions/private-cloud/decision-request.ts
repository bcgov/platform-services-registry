import { DecisionStatus, Prisma, ProjectStatus, RequestType, EventType } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { createEvent } from '@/mutations/events';
import { privateCloudRequestDetailInclude } from '@/queries/private-cloud-requests';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
import { PrivateCloudEditRequestBody } from '@/validation-schemas/private-cloud';

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
      decisionStatus: DecisionStatus.PENDING,
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

  const updatedRequest: PrivateCloudRequestDetail | null = await prisma.privateCloudRequest.update({
    where: {
      id: request.id,
      active: true,
    },
    include: privateCloudRequestDetailInclude,
    data: dataToUpdate,
  });

  if (updatedRequest) {
    await createEvent(EventType.REVIEW_PRIVATE_CLOUD_REQUEST, session.user.id, { requestId: updatedRequest.id });
  }

  return updatedRequest;
}
