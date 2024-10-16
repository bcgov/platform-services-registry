import { DecisionStatus, ProjectStatus, RequestType, EventType, CPU, Memory, Storage } from '@prisma/client';
import { Session } from 'next-auth';
import { defaultQuota } from '@/constants';
import prisma from '@/core/prisma';
import generateLicencePlate from '@/helpers/licence-plate';
import { createEvent, privateCloudRequestDetailInclude } from '@/services/db';
import { upsertUsers } from '@/services/db/user';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
import { PrivateCloudCreateRequestBody } from '@/validation-schemas/private-cloud';

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

  const request: PrivateCloudRequestDetail = await prisma.privateCloudRequest.create({
    data: {
      type: RequestType.CREATE,
      decisionStatus: DecisionStatus.PENDING,
      active: true,
      createdBy: { connect: { email: session.user.email } },
      requestComment: formData.requestComment,
      licencePlate,
      decisionData: { create: createRequestedProject },
      requestData: { create: createRequestedProject },
    },
    include: privateCloudRequestDetailInclude,
  });

  if (request) {
    await createEvent(EventType.CREATE_PRIVATE_CLOUD_PRODUCT, session.user.id, { requestId: request.id });
  }

  return request;
}
