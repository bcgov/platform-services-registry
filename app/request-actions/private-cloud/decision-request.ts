import { DecisionStatus, Prisma, ProjectStatus, RequestType, EventType } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { createEvent, privateCloudRequestDetailInclude } from '@/services/db';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
import { PrivateCloudRequestDecisionBody } from '@/validation-schemas/private-cloud';

export default async function makeRequestDecision(
  id: string,
  formData: PrivateCloudRequestDecisionBody,
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

  const { type, decision, decisionComment, quotaContactName, quotaContactEmail, quotaJustification, ...validFormData } =
    formData;

  const dataToUpdate: Prisma.PrivateCloudRequestUpdateInput = {
    active: decision === DecisionStatus.APPROVED,
    decisionStatus: decision,
    decisionComment,
    decisionDate: new Date(),
    decisionMaker: { connect: { email: session.user.email } },
  };

  // No need to modify decision data when reviewing deletion requests.
  if (request.type !== RequestType.DELETE) {
    dataToUpdate.decisionData = {
      update: {
        ...validFormData,
        status: ProjectStatus.ACTIVE,
        licencePlate: request.licencePlate,
        cluster: request.project?.cluster ?? request.decisionData.cluster,
        projectOwner: {
          connectOrCreate: {
            where: {
              email: validFormData.projectOwner.email,
            },
            create: validFormData.projectOwner,
          },
        },
        primaryTechnicalLead: {
          connectOrCreate: {
            where: {
              email: validFormData.primaryTechnicalLead.email,
            },
            create: validFormData.primaryTechnicalLead,
          },
        },
        secondaryTechnicalLead: validFormData.secondaryTechnicalLead
          ? {
              connectOrCreate: {
                where: {
                  email: validFormData.secondaryTechnicalLead.email,
                },
                create: validFormData.secondaryTechnicalLead,
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
