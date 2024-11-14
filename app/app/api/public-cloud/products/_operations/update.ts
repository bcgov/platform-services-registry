import { DecisionStatus, Prisma, RequestType, EventType } from '@prisma/client';
import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { comparePublicProductData } from '@/helpers/product-change';
import { sendEditRequestEmails } from '@/services/ches/public-cloud';
import { createEvent, getLastClosedPublicCloudRequest, models } from '@/services/db';
import { upsertUsers } from '@/services/db/user';
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

  const { requestComment, accountCoding, isAgMinistryChecked, isEaApproval, ...rest } = body;

  if (!product._permissions.manageMembers) {
    rest.members = product.members.map(({ userId, roles }) => ({ userId, roles }));
  }

  await upsertUsers([
    body.projectOwner.email,
    body.primaryTechnicalLead.email,
    body.secondaryTechnicalLead?.email,
    body.expenseAuthority?.email,
  ]);

  const decisionData = {
    ...rest,
    licencePlate: product.licencePlate,
    status: product.status,
    provider: product.provider,
    createdAt: product.createdAt,
    billing: { connect: { id: product.billingId } },
    projectOwner: { connect: { email: body.projectOwner.email } },
    primaryTechnicalLead: { connect: { email: body.primaryTechnicalLead.email } },
    secondaryTechnicalLead: body.secondaryTechnicalLead
      ? { connect: { email: body.secondaryTechnicalLead.email } }
      : undefined,
    expenseAuthority: body.expenseAuthority ? { connect: { email: body.expenseAuthority.email } } : undefined,
  };

  // Retrieve the latest request data to acquire the decision data ID that can be assigned to the incoming request's original data.
  const previousRequest = await getLastClosedPublicCloudRequest(product.licencePlate);

  const { changes, ...otherChangeMeta } = comparePublicProductData(rest, previousRequest?.decisionData);

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

  const proms = [];

  proms.push(createEvent(EventType.UPDATE_PUBLIC_CLOUD_PRODUCT, session.user.id, { requestId: newRequest.id }));
  proms.push(sendPublicCloudNatsMessage(newRequest));

  proms.push(sendEditRequestEmails(newRequest, session.user.name));

  await Promise.all(proms);

  return OkResponse(newRequest);
}
