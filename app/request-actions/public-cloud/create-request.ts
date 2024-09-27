import { DecisionStatus, ProjectStatus, RequestType, TaskStatus, TaskType, EventType } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import generateLicencePlate from '@/helpers/licence-plate';
import { createEvent } from '@/mutations/events';
import { publicCloudRequestDetailInclude } from '@/queries/public-cloud-requests';
import { upsertUsers } from '@/services/db/user';
import { PublicCloudRequestDetail } from '@/types/public-cloud';
import { PublicCloudCreateRequestBody } from '@/validation-schemas/public-cloud';

export default async function createRequest(formData: PublicCloudCreateRequestBody, session: Session) {
  const licencePlate = await generateLicencePlate();

  await upsertUsers([
    formData.projectOwner.email,
    formData.primaryTechnicalLead.email,
    formData.secondaryTechnicalLead?.email,
    formData.expenseAuthority?.email,
  ]);

  const billingCode = `${formData.accountCoding}_${formData.provider}`;

  const productData = {
    name: formData.name,
    budget: formData.budget,
    provider: formData.provider,
    description: formData.description,
    providerSelectionReasons: formData.providerSelectionReasons,
    providerSelectionReasonsNote: formData.providerSelectionReasonsNote,
    ministry: formData.ministry,
    status: ProjectStatus.ACTIVE,
    licencePlate,
    environmentsEnabled: formData.environmentsEnabled,
    billing: {
      connectOrCreate: {
        where: {
          code: billingCode,
        },
        create: {
          code: billingCode,
          accountCoding: formData.accountCoding,
          expenseAuthority: {
            connectOrCreate: {
              where: {
                email: formData.expenseAuthority.email,
              },
              create: formData.expenseAuthority,
            },
          },
          licencePlate,
        },
      },
    },
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

  const request: PublicCloudRequestDetail = await prisma.publicCloudRequest.create({
    data: {
      type: RequestType.CREATE,
      decisionStatus: DecisionStatus.PENDING,
      active: true,
      createdBy: { connect: { email: session.user.email } },
      licencePlate,
      decisionData: { create: productData },
      requestData: { create: productData },
    },
    include: publicCloudRequestDetailInclude,
  });

  if (request) {
    // Assign a task to the expense authority for new billing
    if (request.decisionData.expenseAuthorityId && !request.decisionData.billing.signed) {
      await prisma.task.create({
        data: {
          type: TaskType.SIGN_MOU,
          status: TaskStatus.ASSIGNED,
          userIds: [request.decisionData.expenseAuthorityId],
          data: {
            licencePlate: request.licencePlate,
          },
        },
      });
    }

    await createEvent(EventType.CREATE_PUBLIC_CLOUD_PRODUCT, session.user.id, { requestId: request.id });
  }

  return request;
}
