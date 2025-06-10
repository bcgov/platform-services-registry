import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { Prisma, Ministry, ProjectStatus, TaskType, PublicCloudProductMemberRole } from '@/prisma/client';
import { PublicCloudProductDecorate } from '@/types/doc-decorate';
import {
  PublicCloudProductDetail,
  PublicCloudProductDetailDecorated,
  PublicCloudProductSimple,
  PublicCloudProductSimpleDecorated,
} from '@/types/public-cloud';
import { getUniqueNonFalsyItems, arraysIntersect } from '@/utils/js';
import { publicCloudProductDetailInclude, publicCloudProductSimpleInclude } from '../includes';
import { createSessionModel } from './core';

async function baseFilter(session: Session) {
  if (!session.isUser && !session.isServiceAccount) return false;
  if (session.permissions.viewAllPublicCloudProducts) return true;

  const OR: Prisma.PublicCloudProductWhereInput[] = [
    { ministry: { in: session.ministries.editor as Ministry[] } },
    { ministry: { in: session.ministries.reader as Ministry[] } },
  ];

  const licencePlatesFromTasks = session.tasks
    .filter((task) =>
      ([TaskType.SIGN_PUBLIC_CLOUD_MOU, TaskType.REVIEW_PUBLIC_CLOUD_MOU] as TaskType[]).includes(task.type),
    )
    .map((task) => (task.data as { licencePlate: string }).licencePlate);

  if (session.user.id) {
    OR.push(
      { projectOwnerId: session.user.id as string },
      { primaryTechnicalLeadId: session.user.id as string },
      { secondaryTechnicalLeadId: session.user.id },
      { expenseAuthorityId: session.user.id },
      { licencePlate: { in: getUniqueNonFalsyItems(licencePlatesFromTasks) } },
      {
        members: {
          some: {
            userId: session.user.id,
            roles: {
              hasSome: [
                PublicCloudProductMemberRole.BILLING_VIEWER,
                PublicCloudProductMemberRole.EDITOR,
                PublicCloudProductMemberRole.VIEWER,
              ],
            },
          },
        },
      },
    );
  }

  const filter: Prisma.PublicCloudProductWhereInput = { OR };
  return filter;
}

async function decorate<T extends PublicCloudProductSimple & Partial<PublicCloudProductDetail>>(
  doc: T,
  session: Session,
  detail: boolean,
) {
  let hasActiveRequest = false;

  if (doc.requests) {
    hasActiveRequest = doc.requests.some((req) => req.active);
  } else {
    hasActiveRequest = (await prisma.publicCloudRequest.count({ where: { projectId: doc.id, active: true } })) > 0;
  }

  const isActive = doc.status === ProjectStatus.ACTIVE;
  const isMaintainer = [doc.projectOwnerId, doc.primaryTechnicalLeadId, doc.secondaryTechnicalLeadId].includes(
    session.user.id,
  );

  const isExpenseAuthority = doc.expenseAuthorityId === session.user.id;

  const members = doc.members || [];

  const canView =
    session.permissions.viewAllPublicCloudProducts ||
    isMaintainer ||
    isExpenseAuthority ||
    session.ministries.reader.includes(doc.ministry) ||
    session.ministries.editor.includes(doc.ministry) ||
    members.some(
      (member) =>
        member.userId === session.user.id &&
        arraysIntersect(member.roles, [
          PublicCloudProductMemberRole.BILLING_VIEWER,
          PublicCloudProductMemberRole.EDITOR,
          PublicCloudProductMemberRole.VIEWER,
        ]),
    );

  const canEdit =
    (isActive &&
      !hasActiveRequest &&
      (session.permissions.editAllPublicCloudProducts ||
        isMaintainer ||
        session.ministries.editor.includes(doc.ministry))) ||
    members.some(
      (member) =>
        member.userId === session.user.id && arraysIntersect(member.roles, [PublicCloudProductMemberRole.EDITOR]),
    );

  const canViewHistroy =
    session.permissions.viewAllPublicCloudProductsHistory || session.ministries.editor.includes(doc.ministry);

  const canReprovision = isActive && (session.isAdmin || session.isPublicAdmin);

  const canSignMou = false;
  const canApproveMou = false;
  const canDownloadMou =
    session.permissions.downloadPublicCloudBillingMou ||
    members.some(
      (member) =>
        member.userId === session.user.id &&
        arraysIntersect(member.roles, [PublicCloudProductMemberRole.BILLING_VIEWER]),
    );

  if (detail) {
    const detailedData = doc as never as PublicCloudProductDetail;
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

  const decoratedDoc = doc as T & PublicCloudProductDecorate;

  decoratedDoc._permissions = {
    view: canView || canSignMou || canApproveMou,
    edit: canEdit,
    delete: canEdit,
    reprovision: canReprovision,
    downloadMou: canDownloadMou,
    manageMembers: [doc.projectOwnerId, doc.primaryTechnicalLeadId, doc.secondaryTechnicalLeadId].includes(
      session.user.id,
    ),
    editAccountCoding:
      session.permissions.reviewPublicCloudBilling ||
      session.isBillingManager ||
      doc.expenseAuthorityId === session.user.id,
  };

  return decoratedDoc;
}

export const publicCloudProductModel = createSessionModel<
  PublicCloudProductSimple,
  PublicCloudProductDetail,
  PublicCloudProductSimpleDecorated,
  PublicCloudProductDetailDecorated,
  NonNullable<Parameters<typeof prisma.publicCloudProduct.create>[0]>,
  NonNullable<Parameters<typeof prisma.publicCloudProduct.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.publicCloudProduct.update>[0]>,
  NonNullable<Parameters<typeof prisma.publicCloudProduct.upsert>[0]>
>({
  model: prisma.publicCloudProduct,
  includeDetail: publicCloudProductDetailInclude,
  includeSimple: publicCloudProductSimpleInclude,
  baseFilter,
  decorate,
});
