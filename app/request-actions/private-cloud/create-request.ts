import { $Enums, DecisionStatus, ProjectStatus, RequestType } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import generateLicencePlate from '@/helpers/licence-plate';
import { createEvent } from '@/mutations/events';
import { upsertUsers } from '@/services/db/user';
import { CpuQuota, MemoryQuota, StorageQuota, PrivateCloudCreateRequestBody } from '@/validation-schemas/private-cloud';

const defaultQuota = {
  cpu: CpuQuota.enum.CPU_REQUEST_0_5_LIMIT_1_5,
  memory: MemoryQuota.enum.MEMORY_REQUEST_2_LIMIT_4,
  storage: StorageQuota.enum.STORAGE_1,
};

export default async function createRequest(formData: PrivateCloudCreateRequestBody, session: Session) {
  const licencePlate = await generateLicencePlate();

  await upsertUsers([
    formData.projectOwner.email,
    formData.primaryTechnicalLead.email,
    formData.secondaryTechnicalLead?.email,
  ]);

  const createRequestedProject = {
    name: formData.name,
    description: formData.description,
    cluster: formData.cluster,
    ministry: formData.ministry,
    status: ProjectStatus.ACTIVE,
    licencePlate: licencePlate,
    commonComponents: formData.commonComponents,
    productionQuota: defaultQuota,
    testQuota: defaultQuota,
    toolsQuota: defaultQuota,
    developmentQuota: defaultQuota,
    projectOwner: {
      connectOrCreate: {
        where: {
          email: formData.projectOwner.email,
        },
        create: formData.projectOwner,
      },
    },
    golddrEnabled: formData.golddrEnabled,
    supportPhoneNumber: formData.supportPhoneNumber,
    isTest: formData.isTest,
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

  const request = await prisma.privateCloudRequest.create({
    data: {
      type: RequestType.CREATE,
      decisionStatus: DecisionStatus.PENDING,
      active: true,
      createdByEmail: session.user.email,
      requestComment: formData.requestComment,
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
  });

  if (request) {
    await createEvent($Enums.EventType.CREATE_PRIVATE_CLOUD_PRODUCT, session.user.id, { requestId: request.id });
  }

  return request;
}
