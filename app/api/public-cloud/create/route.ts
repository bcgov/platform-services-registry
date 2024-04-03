import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { PublicCloudCreateRequestBodySchema } from '@/schema';
import createRequest from '@/request-actions/public-cloud/create-request';
import { sendCreateRequestEmails } from '@/services/ches/public-cloud/email-handler';
import { wrapAsync } from '@/helpers/runtime';
import createApiHandler from '@/core/api-handler';

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { body: PublicCloudCreateRequestBodySchema },
});

export const POST = apiHandler(async ({ body, session }) => {
  const { user, permissions } = session ?? {};
  const { email: authEmail } = user ?? {};

  if (
    ![body.projectOwner.email, body.primaryTechnicalLead.email, body.secondaryTechnicalLead?.email].includes(
      authEmail,
    ) &&
    !permissions.editAllPrivateCloudProducts
  ) {
    return UnauthorizedResponse('not allowed to perform the task');
  }
  const request = await createRequest(body, authEmail);

  wrapAsync(() => sendCreateRequestEmails(request));

  return OkResponse('Success creating request');
});
