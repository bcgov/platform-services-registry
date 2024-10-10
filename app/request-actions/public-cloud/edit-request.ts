import { DecisionStatus, Prisma, RequestType, EventType } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { comparePublicProductData } from '@/helpers/product-change';
import { createEvent, publicCloudRequestDetailInclude, getLastClosedPublicCloudRequest } from '@/services/db';
import { upsertUsers } from '@/services/db/user';
import { PublicCloudRequestDetail } from '@/types/public-cloud';
import { PublicCloudEditRequestBody } from '@/validation-schemas/public-cloud';

export default async function editRequest(
  licencePlate: string,
  formData: PublicCloudEditRequestBody,
  session: Session,
) {
  // Get the current project that we are creating an edit request for
  const project = await prisma.publicCloudProject.findUnique({
    where: {
      licencePlate,
    },
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  });

  if (!project) {
    throw new Error('Project does not exist.');
  }

  const { requestComment, accountCoding, ...rest } = formData;

  await upsertUsers([
    formData.projectOwner.email,
    formData.primaryTechnicalLead.email,
    formData.secondaryTechnicalLead?.email,
    formData.expenseAuthority?.email,
  ]);

  // Merge the form data with the existing project data
  const decisionData = {
    ...rest,
    licencePlate: project.licencePlate,
    status: project.status,
    provider: project.provider,
    createdAt: project.createdAt,
    billing: { connect: { id: project.billingId } },
    projectOwner: { connect: { email: formData.projectOwner.email } },
    primaryTechnicalLead: { connect: { email: formData.primaryTechnicalLead.email } },
    secondaryTechnicalLead: formData.secondaryTechnicalLead
      ? { connect: { email: formData.secondaryTechnicalLead.email } }
      : undefined,
    expenseAuthority: formData.expenseAuthority ? { connect: { email: formData.expenseAuthority.email } } : undefined,
  };

  // Retrieve the latest request data to acquire the decision data ID that can be assigned to the incoming request's original data.
  const previousRequest = await getLastClosedPublicCloudRequest(project.licencePlate);

  const { changes, ...otherChangeMeta } = comparePublicProductData(rest, previousRequest?.decisionData);

  const request: PublicCloudRequestDetail | null = await prisma.publicCloudRequest.create({
    data: {
      type: RequestType.EDIT,
      decisionStatus: DecisionStatus.AUTO_APPROVED, // automatically approve edit requests for public cloud
      active: true,
      createdBy: { connect: { email: session.user.email } },
      licencePlate: project.licencePlate,
      requestComment,
      changes: otherChangeMeta,
      originalData: { connect: { id: previousRequest?.decisionDataId } },
      decisionData: { create: decisionData },
      requestData: { create: decisionData },
      project: { connect: { licencePlate: project.licencePlate } },
    },
    include: publicCloudRequestDetailInclude,
  });

  if (request) {
    await createEvent(EventType.UPDATE_PUBLIC_CLOUD_PRODUCT, session.user.id, { requestId: request.id });
  }

  return request;
}
