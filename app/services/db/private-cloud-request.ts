import { Prisma, Ministry, RequestType, DecisionStatus } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { privateCloudRequestDetailInclude, privateCloudRequestSimpleInclude } from '@/queries/private-cloud-requests';
import { PrivateCloudProjectDecorate, PrivateCloudRequestDecorate } from '@/types/doc-decorate';
import {
  PrivateCloudRequestDetail,
  PrivateCloudRequestDetailDecorated,
  PrivateCloudRequestSimple,
  PrivateCloudRequestSimpleDecorated,
} from '@/types/private-cloud';
import { genReadFilter } from './core';
import { listPrivateCloudProducts } from './private-cloud-product';

async function readFilter(session: Session) {
  if (!session?.userId) return false;
  if (session.permissions.reviewAllPrivateCloudRequests) return true;

  const res = await listPrivateCloudProducts({ select: { licencePlate: true } }, session);
  const licencePlates = res.map(({ licencePlate }) => licencePlate);

  const baseFilter: Prisma.PrivateCloudRequestWhereInput = {
    OR: [
      { licencePlate: { in: licencePlates } },
      { type: RequestType.CREATE, createdByEmail: { equals: session.user.email, mode: 'insensitive' } },
    ],
  };

  return baseFilter;
}

async function writeFilter(session: Session) {
  if (session.permissions.reviewAllPrivateCloudRequests) return true;
  return false;
}

async function decorate<T extends PrivateCloudRequestSimple>(doc: T, session: Session) {
  const canReview = doc.decisionStatus === DecisionStatus.PENDING && session.permissions.reviewAllPrivateCloudRequests;

  const canEdit = canReview && doc.type !== RequestType.DELETE;
  const canResend =
    (doc.decisionStatus === DecisionStatus.APPROVED || doc.decisionStatus === DecisionStatus.AUTO_APPROVED) &&
    session.permissions.reviewAllPrivateCloudRequests;

  const hasProduct = doc.type !== RequestType.CREATE || doc.decisionStatus === DecisionStatus.PROVISIONED;

  const canViewDecision = doc.decisionStatus !== DecisionStatus.PENDING || canReview;

  const decoratedDoc = doc as T & PrivateCloudRequestDecorate;

  if (!hasProduct) {
    decoratedDoc._permissions = {
      view: true,
      edit: canEdit,
      review: canReview,
      resend: canResend,
      delete: false,
      viewDecision: canViewDecision,
      viewProduct: false,
    };

    return doc;
  }

  decoratedDoc._permissions = {
    view: true,
    edit: canEdit,
    review: canReview,
    resend: canResend,
    delete: false,
    viewDecision: canViewDecision,
    viewProduct: hasProduct,
  };

  return decoratedDoc;
}

export function getPrivateCloudRequest(
  args: Prisma.PrivateCloudRequestFindFirstArgs,
): Promise<PrivateCloudRequestDetail>;
export function getPrivateCloudRequest(
  args: Prisma.PrivateCloudRequestFindFirstArgs,
  session: Session,
): Promise<PrivateCloudRequestDetailDecorated>;
export async function getPrivateCloudRequest(
  { where = {}, select, include, ...otherArgs }: Prisma.PrivateCloudRequestFindFirstArgs,
  session?: Session,
) {
  if (session) {
    const filter = await genReadFilter<Prisma.PrivateCloudRequestWhereInput>(where, readFilter);
    if (filter === false) return null;

    where = filter;
  }

  const args: Prisma.PrivateCloudRequestFindFirstArgs = { where, ...otherArgs };
  if (select) args.select = select;
  else args.include = privateCloudRequestDetailInclude;

  const request = await prisma.privateCloudRequest.findFirst(args);
  if (select) return request;

  if (session) {
    return decorate(request as PrivateCloudRequestDetail, session);
  }

  return request;
}

export function listPrivateCloudRequests(
  args: Prisma.PrivateCloudRequestFindManyArgs,
): Promise<PrivateCloudRequestSimple[]>;
export function listPrivateCloudRequests(
  args: Prisma.PrivateCloudRequestFindManyArgs,
  session: Session,
): Promise<PrivateCloudRequestSimpleDecorated[]>;
export async function listPrivateCloudRequests(
  { where = {}, select, include, ...otherArgs }: Prisma.PrivateCloudRequestFindManyArgs,
  session?: Session,
) {
  if (session) {
    const filter = await genReadFilter<Prisma.PrivateCloudRequestWhereInput>(where, readFilter);
    if (filter === false) return null;

    where = filter;
  }

  const args: Prisma.PrivateCloudRequestFindManyArgs = { where, ...otherArgs };
  if (select) args.select = select;
  else args.include = privateCloudRequestSimpleInclude;

  const requests = await prisma.privateCloudRequest.findMany(args);
  if (select) return requests;

  if (session) {
    return requests.map((product) => decorate(product as PrivateCloudRequestSimple, session));
  }

  return requests;
}
