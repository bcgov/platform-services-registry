import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import prisma from '@/core/prisma';
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

  const product = await prisma.privateCloudProduct.findFirst({ where: { licencePlate }, select: { id: true } });
  if (!product) {
    return BadRequestResponse('invalid licence plate');
  }

  const existing = await prisma.privateCloudProductWebhook.findFirst({ where: { licencePlate }, select: { id: true } });
  if (!existing) {
    await prisma.privateCloudProductWebhook.create({ data: { licencePlate } });
  }

  const { data: webhook } = await models.privateCloudProductWebhook.get({ where: { licencePlate } }, session);

  if (!webhook?._permissions.view) {
    return UnauthorizedResponse();
  }

  return OkResponse(webhook);
}
