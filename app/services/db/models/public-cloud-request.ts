import { Prisma, TaskType, TaskStatus, RequestType, DecisionStatus } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PublicCloudRequestDecorate } from '@/types/doc-decorate';
import { PublicCloudRequestDetail, PublicCloudRequestSimple } from '@/types/public-cloud';
import { getUniqueNonFalsyItems } from '@/utils/collection';
import { publicCloudRequestDetailInclude, publicCloudRequestSimpleInclude } from '../includes';
import { createSessionModel } from './core';
import { publicCloudProductModel } from './public-cloud-product';

async function baseFilter(session: Session) {
  if (!session?.userId) return false;
  if (session.permissions.viewAllPublicCloudProducts) return true;

  const { data: products } = await publicCloudProductModel.list({ select: { licencePlate: true } }, session);
  const licencePlates = products.map(({ licencePlate }) => licencePlate);

  const licencePlatesFromTasks = session.tasks
    .filter((task) => [TaskType.SIGN_MOU, TaskType.REVIEW_MOU].includes(task.type))
    .map((task) => (task.data as { licencePlate: string }).licencePlate);

  const filter: Prisma.PublicCloudRequestWhereInput = {
    OR: [
      { licencePlate: { in: getUniqueNonFalsyItems([...licencePlates, ...licencePlatesFromTasks]) } },
      { type: RequestType.CREATE, createdByEmail: { equals: session.user.email, mode: 'insensitive' } },
    ],
  };

  return filter;
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

export const publicCloudRequestModel = createSessionModel<
  PublicCloudRequestSimple,
  PublicCloudRequestDetail,
  PublicCloudRequestDecorate,
  NonNullable<Parameters<typeof prisma.publicCloudRequest.create>[0]>,
  NonNullable<Parameters<typeof prisma.publicCloudRequest.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.publicCloudRequest.update>[0]>,
  NonNullable<Parameters<typeof prisma.publicCloudRequest.upsert>[0]>
>({
  model: prisma.publicCloudRequest,
  includeDetail: publicCloudRequestDetailInclude,
  includeSimple: publicCloudRequestSimpleInclude,
  baseFilter,
  decorate,
});
