import { Prisma, Ministry, RequestType, DecisionStatus } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { privateCloudProductModel } from '@/services/db';
import { PrivateCloudProjectDecorate, PrivateCloudRequestDecorate } from '@/types/doc-decorate';
import {
  PrivateCloudRequestDetail,
  PrivateCloudRequestDetailDecorated,
  PrivateCloudRequestSimple,
  PrivateCloudRequestSimpleDecorated,
} from '@/types/private-cloud';
import { createSessionModel } from './core';

export const privateCloudRequestSimpleInclude = {
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
};

export const privateCloudRequestDetailInclude = {
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
  originalData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
  requestData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  },
};

async function readFilter(session: Session) {
  if (!session?.userId) return false;
  if (session.permissions.reviewAllPrivateCloudRequests) return true;

  const { data: products } = await privateCloudProductModel.list({ select: { licencePlate: true } }, session);
  const licencePlates = products.map(({ licencePlate }) => licencePlate);

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

export const privateCloudRequestModel = createSessionModel<
  PrivateCloudRequestDetail,
  PrivateCloudRequestDetailDecorated,
  PrivateCloudRequestSimple,
  PrivateCloudRequestSimpleDecorated,
  NonNullable<Parameters<typeof prisma.privateCloudRequest.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudRequest.upsert>[0]>
>({
  model: prisma.privateCloudRequest,
  includeDetail: privateCloudRequestDetailInclude,
  includeSimple: privateCloudRequestSimpleInclude,
  readFilter,
  decorate,
});
