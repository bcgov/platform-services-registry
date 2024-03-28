import { NextResponse } from 'next/server';
import { Cluster, PrivateCloudRequest, DecisionStatus, User } from '@prisma/client';
import prisma from '@/core/prisma';
import { PrivateCloudEditRequestBodySchema } from '@/schema';
import { z } from 'zod';
import editRequest from '@/request-actions/private-cloud/edit-request';
import { subscribeUsersToMautic } from '@/services/mautic';
import { sendPrivateCloudNatsMessage } from '@/services/nats';
import { sendEditRequestEmails } from '@/services/ches/private-cloud/email-handler';
import { wrapAsync } from '@/helpers/runtime';
import createApiHandler from '@/core/api-handler';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema, body: PrivateCloudEditRequestBodySchema },
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
    !session.permissions.editAllPrivateCloudProducts
  ) {
    throw new Error('You need to assign yourself to this project in order to create it.');
  }

  const existingRequest: PrivateCloudRequest | null = await prisma.privateCloudRequest.findFirst({
    where: {
      AND: [{ licencePlate }, { active: true }],
    },
  });

  if (existingRequest !== null) {
    throw new Error('This project already has an active request or it does not exist.');
  }

  const request = await editRequest(licencePlate, body, userEmail as string);

  if (request.decisionStatus !== DecisionStatus.APPROVED) {
    wrapAsync(() => sendEditRequestEmails(request));
    return new NextResponse(
      'Successfully edited project, admin approval will be required for this request to be provisioned ',
      { status: 200 },
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

  wrapAsync(() => sendEditRequestEmails(request));

  return new NextResponse('success', { status: 200 });
});
