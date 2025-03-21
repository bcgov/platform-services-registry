import { Ministry, Prisma, PrivateCloudProductMemberRole } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { getPrivateCloudProductContext } from '@/helpers/product';
import { PrivateCloudProductWebhookDecorate } from '@/types/doc-decorate';
import {
  PrivateCloudProductWebhookDetail,
  PrivateCloudProductWebhookSimple,
  PrivateCloudProductWebhookDetailDecorated,
  PrivateCloudProductWebhookSimpleDecorated,
} from '@/types/private-cloud';
import { createSessionModel } from './core';

async function baseFilter(session: Session) {
  if (!session.isUser && !session.isServiceAccount) return false;
  if (session.permissions.viewPrivateProductWebhook) return true;

  const { user, ministries } = session;

  const productFilters: Prisma.PrivateCloudProductWhereInput[] = [
    { projectOwnerId: user.id },
    { primaryTechnicalLeadId: user.id },
    { secondaryTechnicalLeadId: user.id },
    {
      members: {
        some: {
          userId: user.id,
          roles: {
            hasSome: [PrivateCloudProductMemberRole.EDITOR, PrivateCloudProductMemberRole.VIEWER],
          },
        },
      },
    },
    { ministry: { in: ministries.editor as Ministry[] } },
    { ministry: { in: ministries.reader as Ministry[] } },
  ];

  const products = await prisma.privateCloudProject.findMany({
    where: { OR: productFilters },
    select: { licencePlate: true },
  });
  const licencePlates = products.map((product) => product.licencePlate);

  const filter: Prisma.PrivateCloudProductWebhookWhereInput = { licencePlate: { in: licencePlates } };
  return filter;
}

async function decorate<T extends PrivateCloudProductWebhookSimple | PrivateCloudProductWebhookDetail>(
  doc: T,
  session: Session,
) {
  const { permissions } = session;
  const decoratedDoc = doc as T & PrivateCloudProductWebhookDecorate;

  const product = await prisma.privateCloudProject.findUnique({
    where: { licencePlate: doc.licencePlate },
    select: {
      projectOwnerId: true,
      primaryTechnicalLeadId: true,
      secondaryTechnicalLeadId: true,
      ministry: true,
      members: true,
    },
  });

  if (!product) {
    decoratedDoc._permissions = {
      view: false,
      edit: false,
      delete: false,
    };

    return decoratedDoc;
  }

  const { isMaintainer, isViewer, isEditor, isMinistryReader, isMinistryEditor } = getPrivateCloudProductContext(
    product,
    session,
  );

  const canView =
    permissions.viewPrivateProductWebhook ||
    isMaintainer ||
    isViewer ||
    isEditor ||
    isMinistryReader ||
    isMinistryEditor;

  const canEdit = permissions.editPrivateProductWebhook || isMaintainer || isEditor || isMinistryEditor;

  decoratedDoc._permissions = {
    view: canView,
    edit: canEdit,
    delete: canEdit,
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
