import { Prisma, Ministry, ProjectStatus, PrivateCloudProductMemberRole } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PrivateCloudProjectDecorate } from '@/types/doc-decorate';
import {
  PrivateCloudProductDetail,
  PrivateCloudProductDetailDecorated,
  PrivateCloudProductSimple,
  PrivateCloudProductSimpleDecorated,
} from '@/types/private-cloud';
import { arraysIntersect, getUniqueNonFalsyItems } from '@/utils/js';
import { privateCloudProductDetailInclude, privateCloudProductSimpleInclude } from '../includes';
import { createSessionModel } from './core';

async function baseFilter(session: Session) {
  if (!session.isUser && !session.isServiceAccount) return false;
  if (session.permissions.viewAllPrivateCloudProducts) return true;

  const OR: Prisma.PrivateCloudProjectWhereInput[] = [
    { ministry: { in: session.ministries.editor as Ministry[] } },
    { ministry: { in: session.ministries.reader as Ministry[] } },
  ];

  if (session.user.id) {
    OR.push(
      { projectOwnerId: session.user.id as string },
      { primaryTechnicalLeadId: session.user.id as string },
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
    );
  }

  const filter: Prisma.PrivateCloudProjectWhereInput = { OR };
  return filter;
}

async function decorate<T extends PrivateCloudProductSimple | PrivateCloudProductDetail>(
  doc: T,
  session: Session,
  detail: boolean,
) {
  let hasActiveRequest = false;

  if (doc.requests) {
    hasActiveRequest = doc.requests.some((req) => req.active);
  } else {
    hasActiveRequest = (await prisma.privateCloudRequest.count({ where: { projectId: doc.id, active: true } })) > 0;
  }

  const isActive = doc.status === ProjectStatus.ACTIVE;
  const isMyProduct = [doc.projectOwnerId, doc.primaryTechnicalLeadId, doc.secondaryTechnicalLeadId].includes(
    session.user.id,
  );

  const members = doc.members || [];

  const canView =
    session.permissions.viewAllPrivateCloudProducts ||
    isMyProduct ||
    session.ministries.reader.includes(doc.ministry) ||
    session.ministries.editor.includes(doc.ministry) ||
    members.some(
      (member) =>
        member.userId === session.user.id &&
        arraysIntersect(member.roles, [PrivateCloudProductMemberRole.EDITOR, PrivateCloudProductMemberRole.VIEWER]),
    );

  const canEdit =
    (isActive &&
      !hasActiveRequest &&
      (session.permissions.editAllPrivateCloudProducts ||
        isMyProduct ||
        session.ministries.editor.includes(doc.ministry))) ||
    members.some(
      (member) =>
        member.userId === session.user.id && arraysIntersect(member.roles, [PrivateCloudProductMemberRole.EDITOR]),
    );

  const canViewHistroy =
    session.permissions.viewAllPrivateCloudProductsHistory || session.ministries.editor.includes(doc.ministry);

  const canReprovision = isActive && (session.isAdmin || session.isPrivateAdmin);
  const canToggleTemporary = isActive && (session.isAdmin || session.isPrivateAdmin);

  if (detail) {
    const detailedData = doc as never as PrivateCloudProductDetail;
    let memberIds = detailedData.members.map((member) => member.userId);
    memberIds = getUniqueNonFalsyItems(memberIds);
    const users = await prisma.user.findMany({ where: { id: { in: memberIds } } });

    detailedData.members = detailedData.members.map((member) => {
      const user = users.find((usr) => usr.id === member.userId);
      return {
        ...user,
        ...member,
      };
    });
  }

  const decoratedDoc = doc as T & PrivateCloudProjectDecorate;
  decoratedDoc._permissions = {
    view: canView,
    viewHistory: canViewHistroy,
    edit: canEdit,
    delete: canEdit,
    reprovision: canReprovision,
    manageMembers: [doc.projectOwnerId, doc.primaryTechnicalLeadId, doc.secondaryTechnicalLeadId].includes(
      session.user.id,
    ),
    toggleTemporary: canToggleTemporary,
  };

  return decoratedDoc;
}

export const privateCloudProductModel = createSessionModel<
  PrivateCloudProductSimple,
  PrivateCloudProductDetail,
  PrivateCloudProductSimpleDecorated,
  PrivateCloudProductDetailDecorated,
  NonNullable<Parameters<typeof prisma.privateCloudProject.create>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudProject.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudProject.update>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudProject.upsert>[0]>
>({
  model: prisma.privateCloudProject,
  includeDetail: privateCloudProductDetailInclude,
  includeSimple: privateCloudProductSimpleInclude,
  baseFilter,
  decorate,
});
