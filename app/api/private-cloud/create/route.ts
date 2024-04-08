import { PrivateCloudCreateRequestBodySchema } from '@/schema';
import createRequest from '@/request-actions/private-cloud/create-request';
import { sendCreateRequestEmails } from '@/services/ches/private-cloud/email-handler';
import createApiHandler from '@/core/api-handler';
import { wrapAsync } from '@/helpers/runtime';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';

const apiHandler = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.CreatePublicCloudProducts],
  validations: { body: PrivateCloudCreateRequestBodySchema },
});

export const POST = apiHandler(async ({ body, session }) => {
  const { userEmail } = session;

  if (
    !(
      (
        [body.projectOwner.email, body.primaryTechnicalLead.email, body.secondaryTechnicalLead?.email].includes(
          userEmail as string,
        ) || session.permissions.reviewAllPrivateCloudRequests
      )
      // if we want to let ministry editor to create home ministry products no being involved in this product as PO/TL
      // || session.ministries.editor.includes(`${body.ministry}`)
    )
  ) {
    return UnauthorizedResponse('You need to assign yourself to this project in order to create it.');
  }

  const request = await createRequest(body, userEmail as string);

  wrapAsync(() => sendCreateRequestEmails(request));

  return OkResponse('Success creating request');
});
