import { Prisma, Ministry, ProjectStatus } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PrivateCloudProjectDecorate } from '@/types/doc-decorate';
import {
  PrivateCloudProductDetail,
  PrivateCloudProductDetailDecorated,
  PrivateCloudProductSimple,
  PrivateCloudProductSimpleDecorated,
} from '@/types/private-cloud';
import { createSessionModel } from './core';

export const privateCloudProductSimpleInclude = {
  projectOwner: true,
  primaryTechnicalLead: true,
  secondaryTechnicalLead: true,
  requests: {
    where: {
      active: true,
    },
  },
};

export const privateCloudProductDetailInclude = {
  projectOwner: true,
  primaryTechnicalLead: true,
  secondaryTechnicalLead: true,
  requests: {
    where: {
      active: true,
    },
  },
};

async function readFilter(session: Session) {
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
    );
  }

  const baseFilter: Prisma.PrivateCloudProjectWhereInput = { OR };
  return baseFilter;
}

async function writeFilter(session: Session) {
  if (!session.isUser && !session.isServiceAccount) return false;
  if (session.permissions.editAllPrivateCloudProducts) return true;

  const OR: Prisma.PrivateCloudProjectWhereInput[] = [{ ministry: { in: session.ministries.editor as Ministry[] } }];

  if (session.user.id) {
    OR.push(
      { projectOwnerId: session.user.id as string },
      { primaryTechnicalLeadId: session.user.id as string },
      { secondaryTechnicalLeadId: session.user.id },
    );
  }

  const baseFilter: Prisma.PrivateCloudProjectWhereInput = { OR };

  return baseFilter;
}

async function decorate<T extends PrivateCloudProductSimple>(doc: T, session: Session) {
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

  const canView =
    session.permissions.viewAllPrivateCloudProducts ||
    isMyProduct ||
    session.ministries.reader.includes(doc.ministry) ||
    session.ministries.editor.includes(doc.ministry);

  const canEdit =
    isActive &&
    !hasActiveRequest &&
    (session.permissions.editAllPrivateCloudProducts ||
      isMyProduct ||
      session.ministries.editor.includes(doc.ministry));

  const canViewHistroy =
    session.permissions.viewAllPrivateCloudProductsHistory || session.ministries.editor.includes(doc.ministry);

  const canReprovision = isActive && (session.isAdmin || session.isPrivateAdmin);
  const canToggleTemporary = isActive && (session.isAdmin || session.isPrivateAdmin);

  const decoratedDoc = doc as T & PrivateCloudProjectDecorate;
  decoratedDoc._permissions = {
    view: canView,
    viewHistory: canViewHistroy,
    edit: canEdit,
    delete: canEdit,
    reprovision: canReprovision,
    toggleTemporary: canToggleTemporary,
  };

  return decoratedDoc;
}

export const privateCloudProductModel = createSessionModel<
  PrivateCloudProductDetail,
  PrivateCloudProductDetailDecorated,
  PrivateCloudProductSimple,
  PrivateCloudProductSimpleDecorated,
  NonNullable<Parameters<typeof prisma.privateCloudProject.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudProject.upsert>[0]>
>({
  model: prisma.privateCloudProject,
  includeDetail: privateCloudProductDetailInclude,
  includeSimple: privateCloudProductSimpleInclude,
  readFilter,
  decorate,
});
