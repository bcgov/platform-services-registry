import { User } from '@prisma/client';
import { Session } from 'next-auth';
import { z, TypeOf, ZodType } from 'zod';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getPublicCloudProduct } from '@/queries/public-cloud-products';
import editRequest from '@/request-actions/public-cloud/edit-request';
import { PublicCloudEditRequestBody } from '@/schema';
import { sendEditRequestEmails, sendExpenseAuthorityEmail } from '@/services/ches/public-cloud/email-handler';
import { subscribeUsersToMautic } from '@/services/mautic';
import { sendPublicCloudNatsMessage } from '@/services/nats';
import { putPathParamSchema } from '../[licencePlate]/schema';

export default async function updateOp({
  session,
  body,
  pathParams,
}: {
  session: Session;
  body: PublicCloudEditRequestBody;
  pathParams: TypeOf<typeof putPathParamSchema>;
}) {
  const { licencePlate } = pathParams;

  const product = await getPublicCloudProduct(session, licencePlate);

  if (!product?._permissions.edit) {
    return UnauthorizedResponse();
  }

  const request = await editRequest(licencePlate, body, session);

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

  return OkResponse(request);
}
