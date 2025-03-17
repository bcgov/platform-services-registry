import { Ministry, Prisma, PrivateCloudProductMemberRole } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PrivateCloudProductWebhookDecorate } from '@/types/doc-decorate';
import {
  PrivateCloudProductWebhookDetail,
  PrivateCloudProductWebhookSimple,
  PrivateCloudProductWebhookDetailDecorated,
  PrivateCloudProductWebhookSimpleDecorated,
} from '@/types/private-cloud';
import { arraysIntersect } from '@/utils/js';
import { createSessionModel } from './core';

async function baseFilter(session: Session) {
  if (!session?.isUser) return false;
  if (session.permissions.viewWebhook) return {};

  const conditions: Prisma.PrivateCloudProjectWhereInput[] = [
    { ministry: { in: session.ministries.editor as Ministry[] } },
    { ministry: { in: session.ministries.reader as Ministry[] } },
  ];

  if (session.user.id) {
    conditions.push(
      { projectOwnerId: session.user.id },
      { primaryTechnicalLeadId: session.user.id },
      { secondaryTechnicalLeadId: session.user.id },
      {
        members: {
          some: {
            userId: session.user.id,
            roles: { hasSome: [PrivateCloudProductMemberRole.EDITOR, PrivateCloudProductMemberRole.VIEWER] },
          },
        },
      },
    );
  }

  const products = await prisma.privateCloudProject.findMany({
    where: { OR: conditions },
    select: { licencePlate: true },
  });
  const licencePlates = products.map((p) => p.licencePlate);
  return { licencePlate: { in: licencePlates } };
}

async function decorate<T extends PrivateCloudProductWebhookSimple | PrivateCloudProductWebhookDetail>(
  doc: T,
  session: Session,
) {
  const decoratedDoc = doc as T & PrivateCloudProductWebhookDecorate;
  const userId = session.user.id;

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

  const isMyProduct = product
    ? product.projectOwnerId === userId ||
      product.primaryTechnicalLeadId === userId ||
      product.secondaryTechnicalLeadId === userId
    : false;
  const members = product?.members || [];

  const canView =
    session.permissions.viewWebhook ||
    isMyProduct ||
    (product ? session.ministries.reader.includes(product.ministry) : false) ||
    (product ? session.ministries.editor.includes(product.ministry) : false) ||
    members.some(
      (member: any) =>
        member.userId === userId &&
        arraysIntersect(member.roles, [PrivateCloudProductMemberRole.EDITOR, PrivateCloudProductMemberRole.VIEWER]),
    );

  const canEdit =
    session.permissions.editWebhook ||
    isMyProduct ||
    (product ? session.ministries.editor.includes(product.ministry) : false) ||
    members.some(
      (member: any) =>
        member.userId === userId && arraysIntersect(member.roles, [PrivateCloudProductMemberRole.EDITOR]),
    );

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
