import { Prisma, TaskType, TaskStatus, RequestType, DecisionStatus } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { publicCloudRequestDetailInclude, publicCloudRequestSimpleInclude } from '@/queries/public-cloud-requests';
import { PublicCloudProjectDecorate, PublicCloudRequestDecorate } from '@/types/doc-decorate';
import {
  PublicCloudRequestDetail,
  PublicCloudRequestDetailDecorated,
  PublicCloudRequestSimple,
  PublicCloudRequestSimpleDecorated,
} from '@/types/public-cloud';
import { getUniqueNonFalsyItems } from '@/utils/collection';
import { genReadFilter } from './core';
import { listPublicCloudProducts } from './public-cloud-product';

async function readFilter(session: Session) {
  if (!session?.userId) return false;
  if (session.permissions.viewAllPublicCloudProducts) return true;

  const res = await listPublicCloudProducts({ select: { licencePlate: true } }, session);
  const licencePlates = res.map(({ licencePlate }) => licencePlate);

  const licencePlatesFromTasks = session.tasks
    .filter((task) => [TaskType.SIGN_MOU, TaskType.REVIEW_MOU].includes(task.type))
    .map((task) => (task.data as { licencePlate: string }).licencePlate);

  const baseFilter: Prisma.PublicCloudRequestWhereInput = {
    OR: [
      { licencePlate: { in: getUniqueNonFalsyItems([...licencePlates, ...licencePlatesFromTasks]) } },
      { type: RequestType.CREATE, createdByEmail: { equals: session.user.email, mode: 'insensitive' } },
    ],
  };

  return baseFilter;
}

async function writeFilter(session: Session) {
  if (session.permissions.reviewAllPublicCloudRequests) return true;
  return false;
}

async function decorate<T extends PublicCloudRequestSimple>(doc: T, session: Session) {
  let canReview = doc.decisionStatus === DecisionStatus.PENDING && session.permissions.reviewAllPublicCloudRequests;

  let canSignMou = false;
  let canApproveMou = false;

  if (doc.type === RequestType.CREATE) {
    if (doc.decisionData.billing) {
      canSignMou =
        !doc.decisionData.billing.signed &&
        session.tasks
          .filter((task) => task.type === TaskType.SIGN_MOU && task.status === TaskStatus.ASSIGNED)
          .map((task) => (task.data as { licencePlate: string }).licencePlate)
          .includes(doc.licencePlate);

      canApproveMou =
        doc.decisionData.billing.signed &&
        !doc.decisionData.billing.approved &&
        session.tasks
          .filter((task) => task.type === TaskType.REVIEW_MOU && task.status === TaskStatus.ASSIGNED)
          .map((task) => (task.data as { licencePlate: string }).licencePlate)
          .includes(doc.licencePlate);

      canReview = canReview && doc.decisionData.billing.signed && doc.decisionData.billing.approved;
    } else {
      canReview = false;
    }
  }

  const canEdit = canReview && doc.type !== RequestType.DELETE;
  const hasProduct = doc.type !== RequestType.CREATE || doc.decisionStatus === DecisionStatus.PROVISIONED;

  const decoratedDoc = doc as T & PublicCloudRequestDecorate;

  if (!hasProduct) {
    decoratedDoc._permissions = {
      view: true,
      edit: canEdit,
      review: canReview,
      signMou: canSignMou,
      reviewMou: canApproveMou,
      delete: false,
      viewProduct: false,
    };

    return decoratedDoc;
  }

  decoratedDoc._permissions = {
    view: true,
    edit: canEdit,
    review: canReview,
    signMou: canSignMou,
    reviewMou: canApproveMou,
    delete: false,
    viewProduct: hasProduct,
  };

  return decoratedDoc;
}

export function getPublicCloudRequest(args: Prisma.PublicCloudRequestFindFirstArgs): Promise<PublicCloudRequestDetail>;
export function getPublicCloudRequest(
  args: Prisma.PublicCloudRequestFindFirstArgs,
  session: Session,
): Promise<PublicCloudRequestDetailDecorated>;
export async function getPublicCloudRequest(
  { where = {}, select, include, ...otherArgs }: Prisma.PublicCloudRequestFindFirstArgs,
  session?: Session,
) {
  if (session) {
    const filter = await genReadFilter<Prisma.PublicCloudRequestWhereInput>(where, readFilter);
    if (filter === false) return null;

    where = filter;
  }

  const args: Prisma.PublicCloudRequestFindFirstArgs = { where, ...otherArgs };
  if (select) args.select = select;
  else args.include = publicCloudRequestDetailInclude;

  const request = await prisma.publicCloudRequest.findFirst(args);
  if (select) return request;

  if (session) {
    return decorate(request as PublicCloudRequestDetail, session);
  }

  return request;
}

export function listPublicCloudRequests(
  args: Prisma.PublicCloudRequestFindManyArgs,
): Promise<PublicCloudRequestSimple[]>;
export function listPublicCloudRequests(
  args: Prisma.PublicCloudRequestFindManyArgs,
  session: Session,
): Promise<PublicCloudRequestSimpleDecorated[]>;
export async function listPublicCloudRequests(
  { where = {}, select, include, ...otherArgs }: Prisma.PublicCloudRequestFindManyArgs,
  session?: Session,
) {
  if (session) {
    const filter = await genReadFilter<Prisma.PublicCloudRequestWhereInput>(where, readFilter);
    if (filter === false) return null;

    where = filter;
  }

  const args: Prisma.PublicCloudRequestFindManyArgs = { where, ...otherArgs };
  if (select) args.select = select;
  else args.include = publicCloudRequestSimpleInclude;

  const requests = await prisma.publicCloudRequest.findMany(args);
  if (select) return requests;

  if (session) {
    return requests.map((product) => decorate(product as PublicCloudRequestSimple, session));
  }

  return requests;
}
