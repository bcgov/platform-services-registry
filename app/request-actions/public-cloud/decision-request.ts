import { $Enums, DecisionStatus, Prisma, ProjectStatus, RequestType } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { createEvent } from '@/mutations/events';
import { publicCloudRequestDetailInclude } from '@/queries/public-cloud-requests';
import {
  PublicCloudRequestDetail,
  PublicCloudRequestDetailDecorated,
  PublicCloudRequestSearch,
} from '@/types/public-cloud';
import { PublicCloudEditRequestBody } from '@/validation-schemas/public-cloud';

export default async function makeRequestDecision(
  id: string,
  decision: DecisionStatus,
  decisionComment: string | undefined,
  formData: PublicCloudEditRequestBody,
  session: Session,
) {
  const request = await prisma.publicCloudRequest.findUnique({
    where: {
      id,
      active: true,
      decisionStatus: $Enums.DecisionStatus.PENDING,
    },
    include: {
      project: { select: { provider: true } },
      decisionData: { select: { provider: true } },
    },
  });

  if (!request) {
    return null;
  }

  const { accountCoding, ...validFormData } = formData;

  const dataToUpdate: Prisma.PublicCloudRequestUpdateInput = {
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
        ...validFormData,
        status: ProjectStatus.ACTIVE,
        licencePlate: request.licencePlate,
        provider: request.project?.provider ?? request.decisionData.provider,
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
    await createEvent($Enums.EventType.REVIEW_PUBLIC_CLOUD_REQUEST, session.user.id, { requestId: updatedRequest.id });
  }

  return updatedRequest;
}
