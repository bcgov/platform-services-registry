import { NextResponse } from 'next/server';
import { PrivateCloudCreateRequestBodySchema, PrivateCloudCreateRequestBody } from '@/schema';
import createRequest from '@/request-actions/private-cloud/create-request';
import { sendCreateRequestEmails } from '@/services/ches/private-cloud/email-handler';
import createApiHandler from '@/core/api-handler';
import { wrapAsync } from '@/helpers/runtime';

const apiHandler = createApiHandler<any, any, PrivateCloudCreateRequestBody>({
  roles: ['user'],
  validations: { body: PrivateCloudCreateRequestBodySchema },
});
export const POST = apiHandler(async ({ body, session }) => {
  const { isAdmin, user } = session ?? {};
  const { email: authEmail } = user ?? {};

  if (
    ![body.projectOwner.email, body.primaryTechnicalLead.email, body.secondaryTechnicalLead?.email].includes(
      authEmail,
    ) &&
    !isAdmin
  ) {
    throw new Error('You need to assign yourself to this project in order to create it.');
  }

  const request = await createRequest(body, authEmail);

  wrapAsync(() => sendCreateRequestEmails(request));

  return new NextResponse('Success creating request', {
    status: 200,
  });
});
