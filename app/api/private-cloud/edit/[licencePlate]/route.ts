import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/core/auth-options';
import { Cluster, DecisionStatus, User } from '@prisma/client';
import prisma from '@/core/prisma';
import { PrivateCloudEditRequestBodySchema } from '@/schema';
import { string, z } from 'zod';
import editRequest from '@/request-actions/private-cloud/edit-request';
import { subscribeUsersToMautic } from '@/services/mautic';
import { sendPrivateCloudNatsMessage } from '@/services/nats';
import { sendEditRequestEmails } from '@/services/ches/private-cloud/email-handler';
import { wrapAsync } from '@/helpers/runtime';

const ParamsSchema = z.object({
  licencePlate: string(),
});

type Params = z.infer<typeof ParamsSchema>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({
      message: 'You do not have the required credentials.',
    });
  }

  const { isAdmin, user, roles: authRoles } = session ?? {};
  const { email: authEmail } = user ?? {};

  const body = await req.json();

  const parsedParams = ParamsSchema.safeParse(params);
  const parsedBody = PrivateCloudEditRequestBodySchema.safeParse(body);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  if (!parsedBody.success) {
    return new NextResponse(parsedBody.error.message, { status: 400 });
  }

  const formData = parsedBody.data;
  const { licencePlate } = parsedParams.data;

  if (
    ![
      formData.projectOwner.email,
      formData.primaryTechnicalLead.email,
      formData.secondaryTechnicalLead?.email,
    ].includes(authEmail) &&
    !(authRoles.includes('admin') || authRoles.includes(`ministry-${formData.ministry.toLocaleLowerCase()}-admin`))
  ) {
    throw new Error('You need to assign yourself to this project in order to edit it.');
  }

  const existingRequest = await prisma.privateCloudRequest.findFirst({
    where: {
      AND: [{ licencePlate }, { active: true }],
    },
  });

  if (existingRequest !== null) {
    throw new Error('This project already has an active request or it does not exist.');
  }

  const request = await editRequest(licencePlate, formData, authEmail);

  if (request.decisionStatus !== DecisionStatus.APPROVED) {
    wrapAsync(() => sendEditRequestEmails(request));
    return new NextResponse(
      'Successfully edited project, admin approval will be required for this request to be provisioned ',
      { status: 200 },
    );
  }
  const contactChanged =
    formData.projectOwner.email !== request.requestedProject.projectOwner.email ||
    formData.primaryTechnicalLead.email !== request.requestedProject.primaryTechnicalLead.email ||
    formData.secondaryTechnicalLead?.email !== request.requestedProject?.secondaryTechnicalLead?.email;

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
  ].filter((usr): usr is User => Boolean(user));

  await subscribeUsersToMautic(users, request.requestedProject.cluster, 'Private');

  wrapAsync(() => sendEditRequestEmails(request));

  return new NextResponse('success', { status: 200 });
}
