import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import editRequest from '@/request-actions/public-cloud/edit-request';
import { sendEditRequestEmails } from '@/services/ches/public-cloud';
import { publicCloudProductModel } from '@/services/db';
import { sendPublicCloudNatsMessage } from '@/services/nats';
import { PublicCloudEditRequestBody } from '@/validation-schemas/public-cloud';
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

  const { data: product } = await publicCloudProductModel.get({ where: { licencePlate } }, session);

  if (!product?._permissions.edit) {
    return UnauthorizedResponse();
  }

  const request = await editRequest(licencePlate, body, session);

  const proms = [];

  proms.push(sendPublicCloudNatsMessage(request));

  proms.push(sendEditRequestEmails(request, session.user.name));

  await Promise.all(proms);

  return OkResponse(request);
}
