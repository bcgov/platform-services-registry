import { z, TypeOf, ZodType } from 'zod';
import prisma from '@/core/prisma';
import { PrivateCloudEditRequestBodySchema } from '@/schema';
import { Session } from 'next-auth';
import { putPathParamSchema } from '../[licencePlate]/schema';
import { Cluster, PrivateCloudRequest, DecisionStatus, User } from '@prisma/client';
import editRequest from '@/request-actions/private-cloud/edit-request';
import { subscribeUsersToMautic } from '@/services/mautic';
import { sendPrivateCloudNatsMessage } from '@/services/nats';
import { sendEditRequestEmails } from '@/services/ches/private-cloud/email-handler';
import { wrapAsync } from '@/helpers/runtime';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';

export default async function updateOp({
  session,
  body,
  pathParams,
}: {
  session: Session;
  body: TypeOf<typeof PrivateCloudEditRequestBodySchema>;
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
    wrapAsync(() => sendEditRequestEmails(request, true));
    return OkResponse(
      'Successfully edited project, admin approval will be required for this request to be provisioned ',
    );
  }

  const contactChanged =
    body.projectOwner.email !== request.requestedProject.projectOwner.email ||
    body.primaryTechnicalLead.email !== request.requestedProject.primaryTechnicalLead.email ||
    body.secondaryTechnicalLead?.email !== request.requestedProject?.secondaryTechnicalLead?.email;

  await sendPrivateCloudNatsMessage(request.id, request.type, request.requestedProject, contactChanged);

  if (request.requestedProject.cluster === Cluster.GOLD) {
    const goldDrRequest = { ...request };
    goldDrRequest.requestedProject.cluster = Cluster.GOLDDR;
    await sendPrivateCloudNatsMessage(request.id, request.type, request.requestedProject, contactChanged);
    await sendPrivateCloudNatsMessage(
      goldDrRequest.id,
      goldDrRequest.type,
      goldDrRequest.requestedProject,
      contactChanged,
    );
  }

  // Subscribe users to Mautic
  const users: User[] = [
    request.requestedProject.projectOwner,
    request.requestedProject.primaryTechnicalLead,
    request.requestedProject?.secondaryTechnicalLead,
  ].filter((usr): usr is User => Boolean(usr));

  await subscribeUsersToMautic(users, request.requestedProject.cluster, 'Private');

  wrapAsync(() => sendEditRequestEmails(request, false));

  return OkResponse(true);
}
