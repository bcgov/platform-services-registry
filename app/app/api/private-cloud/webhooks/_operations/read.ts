import { Session } from 'next-auth';
import { z, TypeOf, ZodType } from 'zod';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';
import { getPathParamSchema } from '../[licencePlate]/schema';

export default async function readOp({
  session,
  pathParams,
}: {
  session: Session;
  pathParams: TypeOf<typeof getPathParamSchema>;
}) {
  const { licencePlate } = pathParams;

  const { data: webhook } = await models.privateCloudProductWebhook.get({ where: { licencePlate } }, session);

  if (!webhook?._permissions.view) {
    return UnauthorizedResponse();
  }

  return OkResponse(webhook);
}
