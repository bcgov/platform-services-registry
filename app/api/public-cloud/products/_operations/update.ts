import { z, TypeOf, ZodType } from 'zod';
import { PublicCloudEditRequestBody } from '@/schema';
import { Session } from 'next-auth';
import { putPathParamSchema } from '../[licencePlate]/schema';
import { subscribeUsersToMautic } from '@/services/mautic';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { User } from '@prisma/client';
import editRequest from '@/request-actions/public-cloud/edit-request';
import { sendPublicCloudNatsMessage } from '@/services/nats';
import { sendEditRequestEmails, sendExpenseAuthorityEmail } from '@/services/ches/public-cloud/email-handler';
import { getPublicCloudProduct } from '@/queries/public-cloud-products';

export default async function updateOp({
  session,
  body,
  pathParams,
}: {
  session: Session;
  body: PublicCloudEditRequestBody;
  pathParams: TypeOf<typeof putPathParamSchema>;
}) {
  const { user } = session;
  const { licencePlate } = pathParams;

  const product = await getPublicCloudProduct(session, licencePlate);

  if (!product?._permissions.edit) {
    return UnauthorizedResponse();
  }

  const request = await editRequest(licencePlate, body, user.email);

  const proms = [];

  proms.push(sendPublicCloudNatsMessage(request.type, request.decisionData, request.project));

  const users: User[] = [
    request.decisionData.projectOwner,
    request.decisionData.primaryTechnicalLead,
    request.decisionData?.secondaryTechnicalLead,
  ].filter((usr): usr is User => Boolean(usr));

  proms.push(subscribeUsersToMautic(users, request.decisionData.provider, 'Public'));
  proms.push(sendEditRequestEmails(request, session.user.name));

  if (request.decisionData.expenseAuthorityId !== request.project?.expenseAuthorityId) {
    proms.push(sendExpenseAuthorityEmail(request.decisionData));
  }

  await Promise.all(proms);

  return OkResponse('Successfully created and provisioned edit request ');
}
