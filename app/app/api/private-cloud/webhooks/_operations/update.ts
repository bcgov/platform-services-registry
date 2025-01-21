import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import { OkResponse } from '@/core/responses';
import { models } from '@/services/db';
import { PrivateCloudProductWebhookBody } from '@/validation-schemas/private-cloud';
import { putPathParamSchema } from '../[licencePlate]/schema';

export default async function updateOp({
  session,
  body,
  pathParams,
}: {
  session: Session;
  body: PrivateCloudProductWebhookBody;
  pathParams: TypeOf<typeof putPathParamSchema>;
}) {
  const { licencePlate } = pathParams;

  const { data: webhook } = await models.privateCloudProductWebhook.upsert(
    { where: { licencePlate }, update: body, create: { ...body, licencePlate } },
    session,
  );

  return OkResponse(webhook);
}
