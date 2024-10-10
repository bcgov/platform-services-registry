import { DecisionStatus } from '@prisma/client';
import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { sendRequestNatsMessage } from '@/helpers/nats-message';
import editRequest from '@/request-actions/private-cloud/edit-request';
import { sendEditRequestEmails, sendRequestApprovalEmails } from '@/services/ches/private-cloud';
import { models } from '@/services/db';
import { PrivateCloudEditRequestBody } from '@/validation-schemas/private-cloud';
import { putPathParamSchema } from '../[licencePlate]/schema';

export default async function updateOp({
  session,
  body,
  pathParams,
}: {
  session: Session;
  body: PrivateCloudEditRequestBody;
  pathParams: TypeOf<typeof putPathParamSchema>;
}) {
  const { licencePlate } = pathParams;

  const { data: product } = await models.privateCloudProduct.get({ where: { licencePlate } }, session);

  if (!product?._permissions.edit) {
    return UnauthorizedResponse();
  }

  const request = await editRequest(licencePlate, body, session);

  if (request.decisionStatus === DecisionStatus.PENDING) {
    await sendEditRequestEmails(request, session.user.name);
    return OkResponse(request);
  }

  // The EDIT request is Auto-Approved
  const proms = [];

  proms.push(
    sendRequestNatsMessage(request, {
      projectOwner: { email: request.originalData?.projectOwner.email },
      primaryTechnicalLead: { email: request.originalData?.primaryTechnicalLead.email },
      secondaryTechnicalLead: { email: request.originalData?.secondaryTechnicalLead?.email },
    }),
  );

  proms.push(sendRequestApprovalEmails(request, session.user.name));

  await Promise.all(proms);

  return OkResponse(request);
}
