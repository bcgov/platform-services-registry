import { NextResponse } from 'next/server';
import { PublicCloudRequest, User } from '@prisma/client';
import prisma from '@/core/prisma';
import { PublicCloudEditRequestBodySchema } from '@/schema';
import { z } from 'zod';
import editRequest from '@/request-actions/public-cloud/edit-request';
import { subscribeUsersToMautic } from '@/services/mautic';
import { sendPublicCloudNatsMessage } from '@/services/nats';
import { sendEditRequestEmails, sendExpenseAuthorityEmail } from '@/services/ches/public-cloud/email-handler';
import { wrapAsync } from '@/helpers/runtime';
import createApiHandler from '@/core/api-handler';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema, body: PublicCloudEditRequestBodySchema },
});

export const POST = apiHandler(async ({ pathParams, body, session }) => {
  if (!session) {
    return NextResponse.json({
      message: 'You do not have the required credentials.',
    });
  }
  const { userEmail } = session;
  const { licencePlate } = pathParams;

  if (
    userEmail !== null &&
    ![body.projectOwner.email, body.primaryTechnicalLead.email, body.secondaryTechnicalLead?.email].includes(
      userEmail,
    ) &&
    !session.permissions.editAllPublicCloudProducts
  ) {
    throw new Error('You need to assign yourself to this project in order to create it.');
  }

  const existingRequest: PublicCloudRequest | null = await prisma.publicCloudRequest.findFirst({
    where: {
      AND: [{ licencePlate }, { active: true }],
    },
  });

  if (existingRequest !== null) {
    throw new Error('This project already has an active request or it does not exist.');
  }

  const request = await editRequest(licencePlate, body, userEmail as string);

  await sendPublicCloudNatsMessage(request.type, request.requestedProject, request.project);

  wrapAsync(() => {
    const users: User[] = [
      request.requestedProject.projectOwner,
      request.requestedProject.primaryTechnicalLead,
      request.requestedProject?.secondaryTechnicalLead,
    ].filter((usr): usr is User => Boolean(usr));

    subscribeUsersToMautic(users, request.requestedProject.provider, 'Private');
    sendEditRequestEmails(request);
    if (request.requestedProject.expenseAuthorityId !== request.project?.expenseAuthorityId) {
      sendExpenseAuthorityEmail(request.requestedProject);
    }
  });

  return new NextResponse('Successfully created and provisioned edit request ', { status: 200 });
});
