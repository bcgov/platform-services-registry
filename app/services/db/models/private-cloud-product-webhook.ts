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
  if (!session.isUser && !session.isServiceAccount) return false;
  if (session.permissions.viewWebhook) return {};

  const { user, ministries } = session;

  const projectFilters: Prisma.PrivateCloudProjectWhereInput[] = [
    { ministry: { in: ministries.editor as Ministry[] } },
    { ministry: { in: ministries.reader as Ministry[] } },
  ];

  if (user.id) {
    projectFilters.push(
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
    );
  }

  const projects = await prisma.privateCloudProject.findMany({
    where: { OR: projectFilters },
    select: { licencePlate: true },
  });
  const licencePlates = projects.map((project) => project.licencePlate);

  const filter: Prisma.PrivateCloudProductWebhookWhereInput = {
    licencePlate: { in: licencePlates },
  };

  return filter;
}

async function decorate<T extends PrivateCloudProductWebhookSimple | PrivateCloudProductWebhookDetail>(
  doc: T,
  session: Session,
) {
  const { user, permissions, ministries } = session;
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

  const isMyProduct =
    product &&
    [product.projectOwnerId, product.primaryTechnicalLeadId, product.secondaryTechnicalLeadId].includes(user.id);

  const productMinistry = product?.ministry ?? '';
  const members = product?.members || [];
  const hasMinistryAccess = product
    ? ministries.reader.includes(productMinistry) || ministries.editor.includes(productMinistry)
    : false;

  const canView =
    permissions.viewWebhook ||
    isMyProduct ||
    hasMinistryAccess ||
    members.some(
      (member: any) =>
        member.userId === user.id &&
        arraysIntersect(member.roles, [PrivateCloudProductMemberRole.EDITOR, PrivateCloudProductMemberRole.VIEWER]),
    );

  const canEdit =
    permissions.editWebhook ||
    isMyProduct ||
    (product ? ministries.editor.includes(productMinistry) : false) ||
    members.some(
      (member: any) =>
        member.userId === user.id && arraysIntersect(member.roles, [PrivateCloudProductMemberRole.EDITOR]),
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
