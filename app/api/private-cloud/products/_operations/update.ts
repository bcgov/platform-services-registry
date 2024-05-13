import { z, TypeOf, ZodType } from 'zod';
import { PrivateCloudEditRequestBody } from '@/schema';
import { Session } from 'next-auth';
import { putPathParamSchema } from '../[licencePlate]/schema';
import { DecisionStatus, User } from '@prisma/client';
import editRequest from '@/request-actions/private-cloud/edit-request';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { subscribeUsersToMautic } from '@/services/mautic';
import { sendEditRequestEmails } from '@/services/ches/private-cloud/email-handler';
import { sendRequestNatsMessage } from '@/helpers/nats-message';
import { getPrivateCloudProduct } from '@/queries/private-cloud-products';

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

  const request = await editRequest(licencePlate, body, user.email);

  if (request.decisionStatus !== DecisionStatus.APPROVED) {
    await sendEditRequestEmails(request, true, session.user.name);
    return OkResponse(
      'Successfully edited project, admin approval will be required for this request to be provisioned ',
    );
  }

  const proms = [];

  proms.push(
    sendRequestNatsMessage(request, {
      projectOwner: { email: body.projectOwner.email },
      primaryTechnicalLead: { email: body.primaryTechnicalLead.email },
      secondaryTechnicalLead: { email: body.secondaryTechnicalLead?.email },
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
