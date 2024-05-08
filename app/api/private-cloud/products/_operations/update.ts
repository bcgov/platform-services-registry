import { z, TypeOf, ZodType } from 'zod';
import prisma from '@/core/prisma';
import { PrivateCloudEditRequestBody } from '@/schema';
import { Session } from 'next-auth';
import { putPathParamSchema } from '../[licencePlate]/schema';
import { Cluster, PrivateCloudRequest, DecisionStatus, User } from '@prisma/client';
import editRequest from '@/request-actions/private-cloud/edit-request';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { subscribeUsersToMautic } from '@/services/mautic';
import { sendEditRequestEmails } from '@/services/ches/private-cloud/email-handler';
import { sendRequestNatsMessage } from '@/helpers/nats-message';

export default async function updateOp({
  session,
  body,
  pathParams,
}: {
  session: Session;
  body: PrivateCloudEditRequestBody;
  pathParams: TypeOf<typeof putPathParamSchema>;
}) {
  const { userEmail } = session;
  const { licencePlate } = pathParams;

  if (
    !(
      [body.projectOwner.email, body.primaryTechnicalLead.email, body.secondaryTechnicalLead?.email].includes(
        userEmail as string,
      ) ||
      session.permissions.editAllPrivateCloudProducts ||
      session.ministries.editor.includes(`${body.ministry}`)
    )
  ) {
    return UnauthorizedResponse('You need to assign yourself to this project in order to edit it.');
  }

  const existingRequest: PrivateCloudRequest | null = await prisma.privateCloudRequest.findFirst({
    where: {
      AND: [{ licencePlate }, { active: true }],
    },
  });

  if (existingRequest !== null) {
    return BadRequestResponse('This project already has an active request or it does not exist.');
  }

  const request = await editRequest(licencePlate, body, userEmail as string);

  if (request.decisionStatus !== DecisionStatus.APPROVED) {
    await sendEditRequestEmails(request, true);
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
  proms.push(sendEditRequestEmails(request, false));

  await Promise.all(proms);

  return OkResponse(true);
}
