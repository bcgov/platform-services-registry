import { Prisma, Ministry, ProjectStatus, TaskType, TaskStatus } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { publicCloudProductDetailInclude, publicCloudProductSimpleInclude } from '@/queries/public-cloud-products';
import { PublicCloudProjectDecorate } from '@/types/doc-decorate';
import {
  PublicCloudProductDetail,
  PublicCloudProductDetailDecorated,
  PublicCloudProductSimple,
  PublicCloudProductSimpleDecorated,
} from '@/types/public-cloud';
import { getUniqueNonFalsyItems } from '@/utils/collection';
import { genReadFilter } from './core';

async function readFilter(session: Session) {
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

  const baseFilter: Prisma.PublicCloudProjectWhereInput = { OR };

  return baseFilter;
}

async function writeFilter(session: Session) {
  if (!session.isUser && !session.isServiceAccount) return false;
  if (session.permissions.editAllPublicCloudProducts) return true;

  const OR: Prisma.PublicCloudProjectWhereInput[] = [{ ministry: { in: session.ministries.editor as Ministry[] } }];

  if (session.user.id) {
    OR.push(
      { projectOwnerId: session.user.id as string },
      { primaryTechnicalLeadId: session.user.id as string },
      { secondaryTechnicalLeadId: session.user.id },
    );
  }

  const baseFilter: Prisma.PublicCloudProjectWhereInput = { OR };

  return baseFilter;
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

export function getPublicCloudProduct(args: Prisma.PublicCloudProjectFindFirstArgs): Promise<PublicCloudProductDetail>;
export function getPublicCloudProduct(
  args: Prisma.PublicCloudProjectFindFirstArgs,
  session: Session,
): Promise<PublicCloudProductDetailDecorated>;
export async function getPublicCloudProduct(
  { where = {}, select, include, ...otherArgs }: Prisma.PublicCloudProjectFindFirstArgs,
  session?: Session,
) {
  if (session) {
    const filter = await genReadFilter<Prisma.PublicCloudProjectWhereInput>(where, readFilter, session);
    if (filter === false) return null;

    where = filter;
  }

  const args: Prisma.PublicCloudProjectFindFirstArgs = { where, ...otherArgs };
  if (select) args.select = select;
  else args.include = publicCloudProductDetailInclude;

  const product = await prisma.publicCloudProject.findFirst(args);
  if (select) return product;

  if (session) {
    return decorate(product as PublicCloudProductDetail, session);
  }

  return product;
}

export function listPublicCloudProducts(
  args: Prisma.PublicCloudProjectFindManyArgs,
): Promise<PublicCloudProductSimple[]>;
export function listPublicCloudProducts(
  args: Prisma.PublicCloudProjectFindManyArgs,
  session: Session,
): Promise<PublicCloudProductSimpleDecorated[]>;
export async function listPublicCloudProducts(
  { where = {}, select, include, ...otherArgs }: Prisma.PublicCloudProjectFindManyArgs,
  session?: Session,
) {
  if (session) {
    const filter = await genReadFilter<Prisma.PublicCloudProjectWhereInput>(where, readFilter, session);
    if (filter === false) return null;

    where = filter;
  }

  const args: Prisma.PublicCloudProjectFindManyArgs = { where, ...otherArgs };
  if (select) args.select = select;
  else args.include = publicCloudProductSimpleInclude;

  const products = await prisma.publicCloudProject.findMany(args);
  if (select) return products;

  if (session) {
    return products.map((product) => decorate(product as PublicCloudProductSimple, session));
  }

  return products;
}
