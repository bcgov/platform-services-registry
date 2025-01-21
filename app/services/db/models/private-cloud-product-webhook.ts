import { Prisma, PrivateCloudProductMemberRole } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PrivateCloudProductWebhookDecorate } from '@/types/doc-decorate';
import {
  PrivateCloudProductWebhookDetail,
  PrivateCloudProductWebhookSimple,
  PrivateCloudProductWebhookDetailDecorated,
  PrivateCloudProductWebhookSimpleDecorated,
} from '@/types/private-cloud';
import { createSessionModel } from './core';

async function baseFilter(session: Session) {
  if (!session?.user.id) return false;

  const OR: Prisma.PrivateCloudProjectWhereInput[] = [
    { projectOwnerId: session.user.id },
    { primaryTechnicalLeadId: session.user.id },
    { secondaryTechnicalLeadId: session.user.id },
    {
      members: {
        some: {
          userId: session.user.id,
          roles: {
            hasSome: [PrivateCloudProductMemberRole.EDITOR, PrivateCloudProductMemberRole.VIEWER],
          },
        },
      },
    },
  ];

  const products = await prisma.privateCloudProject.findMany({ where: { OR }, select: { licencePlate: true } });
  const productLicencePlates = products.map(({ licencePlate }) => licencePlate);

  const filter: Prisma.PrivateCloudProductWebhookWhereInput = { licencePlate: { in: productLicencePlates } };
  return filter;
}

async function decorate<T extends PrivateCloudProductWebhookSimple | PrivateCloudProductWebhookDetail>(
  doc: T,
  session: Session,
) {
  const decoratedDoc = doc as T & PrivateCloudProductWebhookDecorate;
  decoratedDoc._permissions = {
    view: true,
    edit: true,
    delete: true,
  };

  return decoratedDoc;
}

export const privateCloudProductWebhookModel = createSessionModel<
  PrivateCloudProductWebhookSimple,
  PrivateCloudProductWebhookDetail,
  PrivateCloudProductWebhookSimpleDecorated,
  PrivateCloudProductWebhookDetailDecorated,
  NonNullable<Parameters<typeof prisma.privateCloudProductWebhook.create>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudProductWebhook.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudProductWebhook.update>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudProductWebhook.upsert>[0]>
>({
  model: prisma.privateCloudProductWebhook,
  baseFilter,
  decorate,
});
