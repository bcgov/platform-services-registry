import { Prisma, Ministry, ProjectStatus, TaskType, TaskStatus } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PublicCloudProjectDecorate } from '@/types/doc-decorate';
import { PublicCloudProductDetail, PublicCloudProductSimple } from '@/types/public-cloud';
import { getUniqueNonFalsyItems } from '@/utils/collection';
import { publicCloudProductDetailInclude, publicCloudProductSimpleInclude } from '../includes';
import { createSessionModel } from './core';

async function baseFilter(session: Session) {
  if (!session.isUser && !session.isServiceAccount) return false;
  if (session.permissions.viewAllPublicCloudProducts) return true;

  const OR: Prisma.PublicCloudProjectWhereInput[] = [
    { ministry: { in: session.ministries.editor as Ministry[] } },
    { ministry: { in: session.ministries.reader as Ministry[] } },
  ];

  const licencePlatesFromTasks = session.tasks
    .filter((task) => [TaskType.SIGN_MOU, TaskType.REVIEW_MOU].includes(task.type))
    .map((task) => (task.data as { licencePlate: string }).licencePlate);

  if (session.user.id) {
    OR.push(
      { projectOwnerId: session.user.id as string },
      { primaryTechnicalLeadId: session.user.id as string },
      { secondaryTechnicalLeadId: session.user.id },
      { licencePlate: { in: getUniqueNonFalsyItems(licencePlatesFromTasks) } },
    );
  }

  const filter: Prisma.PublicCloudProjectWhereInput = { OR };
  return filter;
}

async function decorate<T extends PublicCloudProductSimple & Partial<Pick<PublicCloudProductDetail, 'billing'>>>(
  doc: T,
  session: Session,
) {
  let hasActiveRequest = false;

  if (doc.requests) {
    hasActiveRequest = doc.requests.some((req) => req.active);
  } else {
    hasActiveRequest = (await prisma.publicCloudRequest.count({ where: { projectId: doc.id, active: true } })) > 0;
  }

  const isActive = doc.status === ProjectStatus.ACTIVE;
  const isMyProduct = [doc.projectOwnerId, doc.primaryTechnicalLeadId, doc.secondaryTechnicalLeadId].includes(
    session.user.id,
  );

  const canView =
    session.permissions.viewAllPublicCloudProducts ||
    isMyProduct ||
    session.ministries.reader.includes(doc.ministry) ||
    session.ministries.editor.includes(doc.ministry);

  const canEdit =
    isActive &&
    !hasActiveRequest &&
    (session.permissions.editAllPublicCloudProducts || isMyProduct || session.ministries.editor.includes(doc.ministry));

  const canViewHistroy =
    session.permissions.viewAllPublicCloudProductsHistory || session.ministries.editor.includes(doc.ministry);

  const canReprovision = isActive && (session.isAdmin || session.isPublicAdmin);

  let canSignMou = false;
  let canApproveMou = false;

  if (doc.billing) {
    canSignMou =
      !doc.billing.signed &&
      session.tasks
        .filter((task) => task.type === TaskType.SIGN_MOU && task.status === TaskStatus.ASSIGNED)
        .map((task) => (task.data as { licencePlate: string }).licencePlate)
        .includes(doc.licencePlate);

    canApproveMou =
      doc.billing.signed &&
      !doc.billing.approved &&
      session.tasks
        .filter((task) => task.type === TaskType.REVIEW_MOU && task.status === TaskStatus.ASSIGNED)
        .map((task) => (task.data as { licencePlate: string }).licencePlate)
        .includes(doc.licencePlate);
  }

  const decoratedDoc = doc as T & PublicCloudProjectDecorate;

  decoratedDoc._permissions = {
    view: canView || canSignMou || canApproveMou,
    viewHistory: canViewHistroy,
    edit: canEdit,
    delete: canEdit,
    reprovision: canReprovision,
    signMou: canSignMou,
    reviewMou: canApproveMou,
  };

  return decoratedDoc;
}

export const publicCloudProductModel = createSessionModel<
  PublicCloudProductSimple,
  PublicCloudProductDetail,
  PublicCloudProjectDecorate,
  NonNullable<Parameters<typeof prisma.publicCloudProject.create>[0]>,
  NonNullable<Parameters<typeof prisma.publicCloudProject.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.publicCloudProject.update>[0]>,
  NonNullable<Parameters<typeof prisma.publicCloudProject.upsert>[0]>
>({
  model: prisma.publicCloudProject,
  includeDetail: publicCloudProductDetailInclude,
  includeSimple: publicCloudProductSimpleInclude,
  baseFilter,
  decorate,
});
