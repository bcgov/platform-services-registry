import { Prisma, TaskType, TaskStatus, RequestType, DecisionStatus } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PublicCloudProjectDecorate, PublicCloudRequestDecorate } from '@/types/doc-decorate';
import {
  PublicCloudRequestDetail,
  PublicCloudRequestDetailDecorated,
  PublicCloudRequestSimple,
  PublicCloudRequestSimpleDecorated,
} from '@/types/public-cloud';
import { getUniqueNonFalsyItems } from '@/utils/collection';
import { createSessionModel } from './core';
import { publicCloudProductModel } from './public-cloud-product';

export const publicCloudRequestSimpleInclude = {
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
};

export const publicCloudRequestDetailInclude = {
  project: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
  originalData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
  requestData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: true,
    },
  },
  decisionData: {
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
      expenseAuthority: true,
      billing: {
        include: {
          expenseAuthority: true,
          signedBy: true,
          approvedBy: true,
        },
      },
    },
  },
};

async function readFilter(session: Session) {
  if (!session?.userId) return false;
  if (session.permissions.viewAllPublicCloudProducts) return true;

  const { data: products } = await publicCloudProductModel.list({ select: { licencePlate: true } }, session);
  const licencePlates = products.map(({ licencePlate }) => licencePlate);

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

export const publicCloudRequestModel = createSessionModel<
  PublicCloudRequestDetail,
  PublicCloudRequestDetailDecorated,
  PublicCloudRequestSimple,
  PublicCloudRequestSimpleDecorated,
  NonNullable<Parameters<typeof prisma.publicCloudRequest.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.publicCloudRequest.upsert>[0]>
>({
  model: prisma.publicCloudRequest,
  includeDetail: publicCloudRequestDetailInclude,
  includeSimple: publicCloudRequestSimpleInclude,
  readFilter,
  decorate,
});
