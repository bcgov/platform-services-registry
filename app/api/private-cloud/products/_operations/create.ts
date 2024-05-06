import { Session } from 'next-auth';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { PrivateCloudCreateRequestBody } from '@/schema';
import createRequest from '@/request-actions/private-cloud/create-request';
import { sendCreateRequestEmails } from '@/services/ches/private-cloud/email-handler';
import { wrapAsync } from '@/helpers/runtime';
import { logger } from '@/core/logging';

export default async function createOp({ session, body }: { session: Session; body: PrivateCloudCreateRequestBody }) {
  const { user } = session;

  if (
    !(
      [body.projectOwner.email, body.primaryTechnicalLead.email, body.secondaryTechnicalLead?.email].includes(
        user.email,
      ) || session.permissions.reviewAllPrivateCloudRequests
    )
    // if we want to let minitry editor to create home ministry products no being involved in this product as PO/TL
    // || session.ministries.editor.includes(`${body.ministry}`)
  ) {
    return UnauthorizedResponse('You need to assign yourself to this project in order to create it.');
  }

  logger.info('before createRequest');
  const request = await createRequest(body, user.email);
  logger.info('after createRequest');

  logger.info('before sendCreateRequestEmails');
  wrapAsync(() => sendCreateRequestEmails(request));
  logger.info('after sendCreateRequestEmails');

  return OkResponse('Success creating request');
}
