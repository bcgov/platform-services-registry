import { NextResponse } from 'next/server';
import { PrivateCloudCreateRequestBodySchema, PrivateCloudCreateRequestBody } from '@/schema';
import createRequest from '@/requestActions/private-cloud/createRequest';
import { sendCreateRequestEmails } from '@/ches/private-cloud/emailHandler';
import createApiHandler from '@/core/api-handler';

const apiHandler = createApiHandler<any, any, PrivateCloudCreateRequestBody>({
  roles: ['user'],
  validations: { body: PrivateCloudCreateRequestBodySchema },
});
export const POST = apiHandler(async ({ body, session }) => {
  const { email: authEmail, roles: authRoles } = session?.user ?? {};

  if (
    ![body.projectOwner.email, body.primaryTechnicalLead.email, body.secondaryTechnicalLead?.email].includes(
      authEmail,
    ) &&
    !authRoles.includes('admin')
  ) {
    throw new Error('You need to assign yourself to this project in order to create it.');
  }

  const request = await createRequest(body, authEmail);

  sendCreateRequestEmails(request);

  return new NextResponse('Success creating request', {
    status: 200,
  });
});
