import { EventType, DecisionStatus, Prisma, ProjectStatus, RequestType } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { createEvent, publicCloudRequestDetailInclude } from '@/services/db';
import { PublicCloudRequestDetail } from '@/types/public-cloud';
import { PublicCloudRequestDecisionBody } from '@/validation-schemas/public-cloud';

export default async function makeRequestDecision(
  id: string,
  formData: PublicCloudRequestDecisionBody,
  session: Session,
) {
  const request = await prisma.publicCloudRequest.findUnique({
    where: {
      id,
      active: true,
      decisionStatus: DecisionStatus.PENDING,
    },
    include: {
      project: { select: { provider: true } },
      decisionData: { select: { provider: true } },
    },
  });

  if (!request) {
    return null;
  }

  const { type, decision, decisionComment, accountCoding, ...validFormData } = formData;

  const dataToUpdate: Prisma.PublicCloudRequestUpdateInput = {
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
        provider: request.project?.provider ?? request.decisionData.provider,
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
        expenseAuthority: validFormData.expenseAuthority
          ? // this check until expenseAuthority field will be populated for every public cloud product
            {
              connectOrCreate: {
                where: {
                  email: validFormData.expenseAuthority.email,
                },
                create: validFormData.expenseAuthority,
              },
            }
          : undefined,
      },
    };
  }

  const updatedRequest: PublicCloudRequestDetail = await prisma.publicCloudRequest.update({
    where: {
      id: request.id,
      active: true,
    },
    include: publicCloudRequestDetailInclude,
    data: dataToUpdate,
  });

  if (updatedRequest) {
    await createEvent(EventType.REVIEW_PUBLIC_CLOUD_REQUEST, session.user.id, { requestId: updatedRequest.id });
  }

  return updatedRequest;
}
