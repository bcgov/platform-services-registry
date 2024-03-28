import { NextResponse } from 'next/server';
import { PublicCloudCreateRequestBodySchema } from '@/schema';
import createRequest from '@/request-actions/public-cloud/create-request';
import { sendCreateRequestEmails } from '@/services/ches/public-cloud/email-handler';
import { wrapAsync } from '@/helpers/runtime';
import createApiHandler from '@/core/api-handler';
import { PermissionsEnum } from '@/types/permissions';

const apiHandler = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.EditAllPublicCloudProducts],
  validations: { body: PublicCloudCreateRequestBodySchema },
});

export const POST = apiHandler(async ({ body, session }) => {
  if (!session) {
    return NextResponse.json('Authorization failed', { status: 401 });
  }

  const { userEmail, permissions } = session;
  if (
    ![body.projectOwner.email, body.primaryTechnicalLead.email, body.secondaryTechnicalLead?.email].includes(
      userEmail as string,
    ) &&
    !permissions.editAllPrivateCloudProducts
  ) {
    throw new Error('You need to assign yourself to this project in order to create it.');
  }
  const request = await createRequest(body, userEmail as string);

  wrapAsync(() => sendCreateRequestEmails(request));

  return new NextResponse('Success creating request', {
    status: 200,
  });
});
