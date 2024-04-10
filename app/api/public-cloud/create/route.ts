import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { PublicCloudCreateRequestBodySchema } from '@/schema';
import createRequest from '@/request-actions/public-cloud/create-request';
import { sendCreateRequestEmails } from '@/services/ches/public-cloud/email-handler';
import { wrapAsync } from '@/helpers/runtime';
import createApiHandler from '@/core/api-handler';
import { PermissionsEnum } from '@/types/permissions';

const apiHandler = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.CreatePublicCloudProducts],
  validations: { body: PublicCloudCreateRequestBodySchema },
});

export const POST = apiHandler(async ({ body, session }) => {
  const { user } = session ?? {};
  const { email: authEmail } = user ?? {};

  if (
    !(
      [body.projectOwner.email, body.primaryTechnicalLead.email, body.secondaryTechnicalLead?.email].includes(
        authEmail,
      ) || session.permissions.reviewAllPublicCloudRequests
    )
    // if we want to let minitry editor to create home ministry products no being involved in this product as PO/TL
    // || session.ministries.editor.includes(`${body.ministry}`)
  ) {
    return UnauthorizedResponse('You need to assign yourself to this project in order to create it.');
  }

  const request = await createRequest(body, authEmail);

  wrapAsync(() => sendCreateRequestEmails(request));

  return OkResponse('Success creating request');
});
