import { Prisma, RequestType, DecisionStatus } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PrivateCloudRequestDecorate } from '@/types/doc-decorate';
import {
  PrivateCloudRequestDetail,
  PrivateCloudRequestDetailDecorated,
  PrivateCloudRequestSimple,
  PrivateCloudRequestSimpleDecorated,
} from '@/types/private-cloud';
import { privateCloudRequestDetailInclude, privateCloudRequestSimpleInclude } from '../includes';
import { createSessionModel } from './core';
import { privateCloudProductModel } from './private-cloud-product';

async function baseFilter(session: Session) {
  if (!session?.userId) return false;
  if (session.permissions.reviewAllPrivateCloudRequests) return true;

  const { data: products } = await privateCloudProductModel.list({ select: { licencePlate: true } }, session);
  const licencePlates = products.map(({ licencePlate }) => licencePlate);

  const filter: Prisma.PrivateCloudRequestWhereInput = {
    OR: [
      { licencePlate: { in: licencePlates } },
      { type: RequestType.CREATE, createdByEmail: { equals: session.user.email, mode: 'insensitive' } },
    ],
  };

  return filter;
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

export const privateCloudRequestModel = createSessionModel<
  PrivateCloudRequestSimple,
  PrivateCloudRequestDetail,
  PrivateCloudRequestSimpleDecorated,
  PrivateCloudRequestDetailDecorated,
  NonNullable<Parameters<typeof prisma.privateCloudRequest.create>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudRequest.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudRequest.update>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudRequest.upsert>[0]>
>({
  model: prisma.privateCloudRequest,
  includeDetail: privateCloudRequestDetailInclude,
  includeSimple: privateCloudRequestSimpleInclude,
  baseFilter,
  decorate,
});
