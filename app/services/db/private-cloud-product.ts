import { Prisma, Ministry, ProjectStatus } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { privateCloudProductDetailInclude, privateCloudProductSimpleInclude } from '@/queries/private-cloud-products';
import { PrivateCloudProjectDecorate } from '@/types/doc-decorate';
import {
  PrivateCloudProductDetail,
  PrivateCloudProductDetailDecorated,
  PrivateCloudProductSimple,
  PrivateCloudProductSimpleDecorated,
} from '@/types/private-cloud';
import { genReadFilter } from './core';

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

export function getPrivateCloudProduct(
  args: Prisma.PrivateCloudProjectFindFirstArgs,
): Promise<PrivateCloudProductDetail>;
export function getPrivateCloudProduct(
  args: Prisma.PrivateCloudProjectFindFirstArgs,
  session: Session,
): Promise<PrivateCloudProductDetailDecorated>;
export async function getPrivateCloudProduct(
  { where = {}, select, include, ...otherArgs }: Prisma.PrivateCloudProjectFindFirstArgs,
  session?: Session,
) {
  if (session) {
    const filter = await genReadFilter<Prisma.PrivateCloudProjectWhereInput>(where, readFilter, session);
    if (filter === false) return null;

    where = filter;
  }

  const args: Prisma.PrivateCloudProjectFindFirstArgs = { where, ...otherArgs };
  if (select) args.select = select;
  else args.include = privateCloudProductDetailInclude;

  const product = await prisma.privateCloudProject.findFirst(args);
  if (select) return product;

  if (session) {
    return decorate(product as PrivateCloudProductDetail, session);
  }

  return product;
}

export function listPrivateCloudProducts(
  args: Prisma.PrivateCloudProjectFindManyArgs,
): Promise<PrivateCloudProductSimple[]>;
export function listPrivateCloudProducts(
  args: Prisma.PrivateCloudProjectFindManyArgs,
  session: Session,
): Promise<PrivateCloudProductSimpleDecorated[]>;
export async function listPrivateCloudProducts(
  { where = {}, select, include, ...otherArgs }: Prisma.PrivateCloudProjectFindManyArgs,
  session?: Session,
) {
  if (session) {
    const filter = await genReadFilter<Prisma.PrivateCloudProjectWhereInput>(where, readFilter, session);
    if (filter === false) return null;

    where = filter;
  }

  const args: Prisma.PrivateCloudProjectFindManyArgs = { where, ...otherArgs };
  if (select) args.select = select;
  else args.include = privateCloudProductSimpleInclude;

  const products = await prisma.privateCloudProject.findMany(args);
  if (select) return products;

  if (session) {
    return products.map((product) => decorate(product as PrivateCloudProductSimple, session));
  }

  return products;
}
