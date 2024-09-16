import { DecisionStatus, User } from '@prisma/client';
import { Session } from 'next-auth';
import { z, TypeOf, ZodType } from 'zod';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { sendRequestNatsMessage } from '@/helpers/nats-message';
import { getPrivateCloudProduct } from '@/queries/private-cloud-products';
import editRequest from '@/request-actions/private-cloud/edit-request';
import { sendEditRequestEmails, sendRequestApprovalEmails } from '@/services/ches/private-cloud/email-handler';
import { subscribeUsersToMautic } from '@/services/mautic';
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

  const product = await getPrivateCloudProduct(session, licencePlate);

  if (!product?._permissions.edit) {
    return UnauthorizedResponse();
  }

  const request = await editRequest(licencePlate, body, session);

  if (request.decisionStatus === DecisionStatus.PENDING) {
    await sendEditRequestEmails(request, session.user.name);
    return OkResponse(request);
  }

  const proms = [];

  proms.push(
    sendRequestNatsMessage(request, {
      projectOwner: { email: request.originalData?.projectOwner.email },
      primaryTechnicalLead: { email: request.originalData?.primaryTechnicalLead.email },
      secondaryTechnicalLead: { email: request.originalData?.secondaryTechnicalLead?.email },
    }),
  );

  // Subscribe users to Mautic
  const users: User[] = [
    request.decisionData.projectOwner,
    request.decisionData.primaryTechnicalLead,
    request.decisionData?.secondaryTechnicalLead,
  ].filter((usr): usr is User => Boolean(usr));

  proms.push(subscribeUsersToMautic(users, request.decisionData.cluster, 'Private'));

  if (request.decisionStatus === DecisionStatus.APPROVED) {
    proms.push(sendRequestApprovalEmails(request));
  }

  await Promise.all(proms);

  return OkResponse(request);
}
