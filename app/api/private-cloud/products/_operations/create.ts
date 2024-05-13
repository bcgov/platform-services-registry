import { Session } from 'next-auth';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { PrivateCloudCreateRequestBody } from '@/schema';
import createRequest from '@/request-actions/private-cloud/create-request';
import { sendCreateRequestEmails } from '@/services/ches/private-cloud/email-handler';

export default async function createOp({ session, body }: { session: Session; body: PrivateCloudCreateRequestBody }) {
  const { user, permissions, ministries } = session;

  const canCreate =
    // 1. can create one globally
    permissions.createPrivateCloudProducts ||
    // 2. can create one as an product member
    [body.projectOwner.email, body.primaryTechnicalLead.email, body.secondaryTechnicalLead?.email].includes(
      user.email,
    ) ||
    // 3. can create one as a ministry editor
    ministries.editor.includes(body.ministry);

  if (!canCreate) {
    return UnauthorizedResponse();
  }

  const request = await createRequest(body, user.email);

  await sendCreateRequestEmails(request, user.name);

  return OkResponse('Success creating request');
}
