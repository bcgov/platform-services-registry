import { DecisionStatus, User } from '@prisma/client';
import { Session } from 'next-auth';
import { z, TypeOf, ZodType } from 'zod';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { sendRequestNatsMessage } from '@/helpers/nats-message';
import { getPrivateCloudProduct } from '@/queries/private-cloud-products';
import editRequest from '@/request-actions/private-cloud/edit-request';
import { PrivateCloudEditRequestBody } from '@/schema';
import { sendEditRequestEmails } from '@/services/ches/private-cloud/email-handler';
import { subscribeUsersToMautic } from '@/services/mautic';
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
  const { user } = session;
  const { licencePlate } = pathParams;

  const product = await getPrivateCloudProduct(session, licencePlate);

  if (!product?._permissions.edit) {
    return UnauthorizedResponse();
  }

  const request = await editRequest(licencePlate, body, session);

  if (request.decisionStatus !== DecisionStatus.APPROVED) {
    await sendEditRequestEmails(request, true, session.user.name);
    return OkResponse(
      'Successfully edited project, admin approval will be required for this request to be provisioned ',
    );
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
  proms.push(sendEditRequestEmails(request, false, session.user.name));

  await Promise.all(proms);

  return OkResponse(true);
}
