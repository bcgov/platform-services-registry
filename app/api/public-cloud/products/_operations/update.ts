import { z, TypeOf, ZodType } from 'zod';
import prisma from '@/core/prisma';
import { PublicCloudEditRequestBody } from '@/schema';
import { Session } from 'next-auth';
import { putPathParamSchema } from '../[licencePlate]/schema';
import { subscribeUsersToMautic } from '@/services/mautic';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { PublicCloudRequest, User } from '@prisma/client';
import editRequest from '@/request-actions/public-cloud/edit-request';
import { sendPublicCloudNatsMessage } from '@/services/nats';
import { sendEditRequestEmails, sendExpenseAuthorityEmail } from '@/services/ches/public-cloud/email-handler';

export default async function updateOp({
  session,
  body,
  pathParams,
}: {
  session: Session;
  body: PublicCloudEditRequestBody;
  pathParams: TypeOf<typeof putPathParamSchema>;
}) {
  if (!session) {
    return UnauthorizedResponse('You do not have the required credentials.');
  }
  const { userEmail } = session;
  const { licencePlate } = pathParams;

  if (
    ![body.projectOwner.email, body.primaryTechnicalLead.email, body.secondaryTechnicalLead?.email].includes(
      userEmail as string,
    ) &&
    !(session.permissions.editAllPublicCloudProducts || session.ministries.editor.includes(`${body.ministry}`))
  ) {
    return UnauthorizedResponse('You need to assign yourself to this project in order to create it.');
  }

  const existingRequest: PublicCloudRequest | null = await prisma.publicCloudRequest.findFirst({
    where: {
      AND: [{ licencePlate }, { active: true }],
    },
  });

  if (existingRequest !== null) {
    return BadRequestResponse('This project already has an active request or it does not exist.');
  }

  const request = await editRequest(licencePlate, body, userEmail as string);

  const proms = [];

  proms.push(sendPublicCloudNatsMessage(request.type, request.requestedProject, request.project));

  const users: User[] = [
    request.requestedProject.projectOwner,
    request.requestedProject.primaryTechnicalLead,
    request.requestedProject?.secondaryTechnicalLead,
  ].filter((usr): usr is User => Boolean(usr));

  proms.push(subscribeUsersToMautic(users, request.requestedProject.provider, 'Private'));
  proms.push(sendEditRequestEmails(request));

  if (request.requestedProject.expenseAuthorityId !== request.project?.expenseAuthorityId) {
    proms.push(sendExpenseAuthorityEmail(request.requestedProject));
  }

  await Promise.all(proms);

  return OkResponse('Successfully created and provisioned edit request ');
}
