import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import prisma from '@/core/prisma';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { comparePublicProductData } from '@/helpers/product-change';
import { DecisionStatus, RequestType, EventType } from '@/prisma/client';
import { sendEditRequestEmails } from '@/services/ches/public-cloud';
import { createEvent, getLastEffectivePublicCloudRequest, getUsersEmailsByIds, models } from '@/services/db';
import { sendPublicCloudNatsMessage } from '@/services/nats';
import { PublicCloudEditRequestBody } from '@/validation-schemas/public-cloud';
import { putPathParamSchema } from '../[licencePlate]/schema';

export default async function updateOp({
  session,
  body,
  pathParams,
}: {
  session: Session;
  body: PublicCloudEditRequestBody;
  pathParams: TypeOf<typeof putPathParamSchema>;
}) {
  const { licencePlate } = pathParams;

  const { data: product } = await models.publicCloudProduct.get({ where: { licencePlate } }, session);

  if (!product?._permissions.edit) {
    return UnauthorizedResponse();
  }

  const {
    projectOwnerId,
    primaryTechnicalLeadId,
    secondaryTechnicalLeadId,
    expenseAuthorityId,
    requestComment,
    isAgMinistry,
    isAgMinistryChecked,
    organizationId,
    ...rest
  } = body;

  if (!product._permissions.manageMembers) {
    rest.members = product.members.map(({ userId, roles }) => ({ userId, roles }));
  }

  const decisionData = {
    ...rest,
    licencePlate: product.licencePlate,
    status: product.status,
    provider: product.provider,
    createdAt: product.createdAt,
    organization: { connect: { id: organizationId } },
    projectOwner: { connect: { id: projectOwnerId } },
    primaryTechnicalLead: { connect: { id: primaryTechnicalLeadId } },
    secondaryTechnicalLead: secondaryTechnicalLeadId ? { connect: { id: secondaryTechnicalLeadId } } : undefined,
    expenseAuthority: { connect: { id: expenseAuthorityId } },
  };

  const [projectOwner, primaryTechnicalLead, secondaryTechnicalLead, expenseAuthority] = await getUsersEmailsByIds([
    projectOwnerId,
    primaryTechnicalLeadId,
    secondaryTechnicalLeadId,
    expenseAuthorityId,
  ]);

  const comparisonData = {
    ...rest,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    expenseAuthority,
  };

  // Retrieve the latest request data to acquire the decision data ID that can be assigned to the incoming request's original data.
  const previousRequest = await getLastEffectivePublicCloudRequest(product.licencePlate);

  const newOrganization = await prisma.organization.findUnique({ where: { id: organizationId } });
  const { changes, ...otherChangeMeta } = comparePublicProductData(
    { ...comparisonData, organization: newOrganization },
    previousRequest?.decisionData,
  );

  const newRequest = (
    await models.publicCloudRequest.create(
      {
        data: {
          type: RequestType.EDIT,
          decisionStatus: DecisionStatus.AUTO_APPROVED, // automatically approve edit requests for public cloud
          active: true,
          createdBy: { connect: { email: session.user.email } },
          licencePlate: product.licencePlate,
          requestComment,
          changes: otherChangeMeta,
          originalData: { connect: { id: previousRequest?.decisionDataId } },
          decisionData: { create: decisionData },
          requestData: { create: decisionData },
          project: { connect: { licencePlate: product.licencePlate } },
        },
      },
      session,
    )
  ).data;

  const proms = [
    createEvent(EventType.UPDATE_PUBLIC_CLOUD_PRODUCT, session.user.id, { requestId: newRequest.id }),
    sendPublicCloudNatsMessage(newRequest),
    sendEditRequestEmails(newRequest, session.user.name),
  ];

  await Promise.all(proms);

  return OkResponse(newRequest);
}
