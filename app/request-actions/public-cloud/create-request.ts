import { $Enums, DecisionStatus, ProjectStatus, RequestType, TaskStatus, TaskType } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import generateLicencePlate from '@/helpers/licence-plate';
import { createEvent } from '@/mutations/events';
import { PublicCloudCreateRequestBody } from '@/schema';
import { upsertUsers } from '@/services/db/user';

export default async function createRequest(formData: PublicCloudCreateRequestBody, session: Session) {
  const licencePlate = await generateLicencePlate();

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
    environmentsEnabled: formData.environmentsEnabled,
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

  const request = await prisma.publicCloudRequest.create({
    data: {
      type: RequestType.CREATE,
      decisionStatus: DecisionStatus.PENDING,
      active: true,
      createdByEmail: session.user.email,
      licencePlate,
      decisionData: {
        create: createRequestedProject,
      },
      requestData: {
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
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
    },
  });

  if (request) {
    // if (request.decisionData.expenseAuthorityId) {
    //   await prisma.task.create({
    //     data: {
    //       type: TaskType.SIGN_MOU,
    //       status: TaskStatus.ASSIGNED,
    //       userIds: [request.decisionData.expenseAuthorityId],
    //       data: {
    //         requestId: request.id,
    //       },
    //     },
    //   });
    // }

    await createEvent($Enums.EventType.CREATE_PUBLIC_CLOUD_PRODUCT, session.user.id, { requestId: request.id });
  }

  return request;
}
