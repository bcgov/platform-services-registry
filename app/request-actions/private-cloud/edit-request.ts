import { DecisionStatus, Cluster, RequestType, EventType } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { comparePrivateProductData } from '@/helpers/product-change';
import { isQuotaUpgrade } from '@/helpers/quota-change';
import { createEvent } from '@/mutations/events';
import { getLastClosedPrivateCloudRequest, privateCloudRequestDetailInclude } from '@/queries/private-cloud-requests';
import { upsertUsers } from '@/services/db/user';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
import { PrivateCloudEditRequestBody } from '@/validation-schemas/private-cloud';

export default async function editRequest(
  licencePlate: string,
  formData: PrivateCloudEditRequestBody,
  session: Session,
) {
  // Get the current project that we are creating an edit request for
  const project = await prisma.privateCloudProject.findUnique({
    where: {
      licencePlate: licencePlate,
    },
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  });

  if (!project) {
    throw new Error('Project does not exist.');
  }

  const { requestComment, quotaContactName, quotaContactEmail, quotaJustification, ...rest } = formData;

  await upsertUsers([
    formData.projectOwner.email,
    formData.primaryTechnicalLead.email,
    formData.secondaryTechnicalLead?.email,
  ]);

  // merge the form data with the existing project data
  const productData = {
    ...rest,
    licencePlate: project.licencePlate,
    status: project.status,
    cluster: project.cluster,
    createdAt: project.createdAt,
    projectOwner: { connect: { email: formData.projectOwner.email } },
    primaryTechnicalLead: { connect: { email: formData.primaryTechnicalLead.email } },
    secondaryTechnicalLead: formData.secondaryTechnicalLead
      ? { connect: { email: formData.secondaryTechnicalLead.email } }
      : undefined,
  };

  // The edit request will require manual admin approval if any of the quotas are being changed.
  const isNoQuotaChanged =
    JSON.stringify(formData.productionQuota) === JSON.stringify(project.productionQuota) &&
    JSON.stringify(formData.testQuota) === JSON.stringify(project.testQuota) &&
    JSON.stringify(formData.developmentQuota) === JSON.stringify(project.developmentQuota) &&
    JSON.stringify(formData.toolsQuota) === JSON.stringify(project.toolsQuota);

  let decisionStatus: DecisionStatus;

  const hasGolddrEnabledChanged = project.cluster === Cluster.GOLD && project.golddrEnabled !== formData.golddrEnabled;

  // If there is no quota change or no quota upgrade and no golddr flag changes, the request is automatically approved
  if ((isNoQuotaChanged || !isQuotaUpgrade(formData, project)) && !hasGolddrEnabledChanged) {
    decisionStatus = DecisionStatus.APPROVED;
  } else {
    decisionStatus = DecisionStatus.PENDING;
  }

  // Retrieve the latest request data to acquire the decision data ID that can be assigned to the incoming request's original data.
  const previousRequest = await getLastClosedPrivateCloudRequest(project.licencePlate);

  const { changes, ...otherChangeMeta } = comparePrivateProductData(rest, previousRequest?.decisionData);

  const quotaChangeInfo = isNoQuotaChanged
    ? {}
    : {
        quotaContactName,
        quotaContactEmail,
        quotaJustification,
      };

  const request: PrivateCloudRequestDetail = await prisma.privateCloudRequest.create({
    data: {
      type: RequestType.EDIT,
      decisionStatus,
      isQuotaChanged: !isNoQuotaChanged,
      ...quotaChangeInfo,
      active: true,
      createdBy: { connect: { email: session.user.email } },
      licencePlate: project.licencePlate,
      requestComment,
      changes: otherChangeMeta,
      originalData: { connect: { id: previousRequest?.decisionDataId } },
      decisionData: { create: productData },
      requestData: { create: productData },
      project: { connect: { licencePlate: project.licencePlate } },
    },
    include: privateCloudRequestDetailInclude,
  });

  if (request) {
    await createEvent(EventType.UPDATE_PRIVATE_CLOUD_PRODUCT, session.user.id, { requestId: request.id });
  }

  return request;
}
