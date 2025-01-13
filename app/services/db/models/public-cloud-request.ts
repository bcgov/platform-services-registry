import { Prisma, TaskType, TaskStatus, RequestType, DecisionStatus } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PublicCloudRequestDecorate } from '@/types/doc-decorate';
import {
  PublicCloudRequestDetail,
  PublicCloudRequestDetailDecorated,
  PublicCloudRequestSimple,
  PublicCloudRequestSimpleDecorated,
} from '@/types/public-cloud';
import { getUniqueNonFalsyItems } from '@/utils/js';
import { publicCloudRequestDetailInclude, publicCloudRequestSimpleInclude } from '../includes';
import { createSessionModel } from './core';
import { publicCloudProductModel } from './public-cloud-product';

async function baseFilter(session: Session) {
  if (!session?.userId) return false;
  if (session.permissions.viewAllPublicCloudProducts) return true;

  const { data: products } = await publicCloudProductModel.list({ select: { licencePlate: true } }, session);
  const licencePlates = products.map(({ licencePlate }) => licencePlate);

  const licencePlatesFromTasks = session.tasks
    .filter(
      (task) =>
        ([TaskType.SIGN_PUBLIC_CLOUD_MOU, TaskType.REVIEW_PUBLIC_CLOUD_MOU] as TaskType[]).includes(task.type) &&
        task.status === TaskStatus.ASSIGNED,
    )
    .map((task) => (task.data as { licencePlate: string }).licencePlate);

  const requestIdsFromTasks = session.tasks
    .filter(
      (task) =>
        ([TaskType.REVIEW_PUBLIC_CLOUD_REQUEST] as TaskType[]).includes(task.type) &&
        task.status === TaskStatus.ASSIGNED,
    )
    .map((task) => (task.data as { requestId: string }).requestId);

  const filter: Prisma.PublicCloudRequestWhereInput = {
    OR: [
      { licencePlate: { in: getUniqueNonFalsyItems([...licencePlates, ...licencePlatesFromTasks]) } },
      { id: { in: getUniqueNonFalsyItems([...requestIdsFromTasks]) } },
      { type: RequestType.CREATE, createdByEmail: { equals: session.user.email, mode: 'insensitive' } },
    ],
  };

  return filter;
}

async function decorate<T extends PublicCloudRequestSimple | PublicCloudRequestDetail>(
  doc: T,
  session: Session,
  detail: boolean,
) {
  let canReview = false;
  let canSignMou = false;
  let canApproveMou = false;

  if (doc.type === RequestType.CREATE || doc.type === RequestType.DELETE) {
    if (doc.decisionData.billing) {
      canSignMou =
        !doc.decisionData.billing.signed &&
        session.tasks
          .filter((task) => task.type === TaskType.SIGN_PUBLIC_CLOUD_MOU && task.status === TaskStatus.ASSIGNED)
          .map((task) => (task.data as { licencePlate: string }).licencePlate)
          .includes(doc.licencePlate);

      canApproveMou =
        doc.decisionData.billing.signed &&
        !doc.decisionData.billing.approved &&
        session.tasks
          .filter((task) => task.type === TaskType.REVIEW_PUBLIC_CLOUD_MOU && task.status === TaskStatus.ASSIGNED)
          .map((task) => (task.data as { licencePlate: string }).licencePlate)
          .includes(doc.licencePlate);

      canReview =
        doc.decisionStatus === DecisionStatus.PENDING &&
        doc.decisionData.billing.signed &&
        doc.decisionData.billing.approved &&
        session.tasks
          .filter((task) => task.type === TaskType.REVIEW_PUBLIC_CLOUD_REQUEST && task.status === TaskStatus.ASSIGNED)
          .map((task) => (task.data as { requestId: string }).requestId)
          .includes(doc.id);
    }
  }

  const canCancel =
    session.user.email === doc.createdBy?.email &&
    (doc.type === RequestType.DELETE || doc.type === RequestType.EDIT || doc.type === RequestType.CREATE);

  const canEdit = (canReview && doc.type !== RequestType.DELETE) || canCancel;

  const hasProduct = doc.type !== RequestType.CREATE || doc.decisionStatus === DecisionStatus.PROVISIONED;

  const decoratedDoc = doc as T & PublicCloudRequestDecorate;

  if (detail) {
    let memberIds = [];

    const detailedData = doc as never as PublicCloudRequestDetail;
    if (detailedData.originalData) {
      memberIds.push(...detailedData.originalData.members.map((member) => member.userId));
    }

    if (detailedData.requestData) {
      memberIds.push(...detailedData.requestData.members.map((member) => member.userId));
    }

    if (detailedData.decisionData) {
      memberIds.push(...detailedData.decisionData.members.map((member) => member.userId));
    }

    memberIds = getUniqueNonFalsyItems(memberIds);
    const users = await prisma.user.findMany({ where: { id: { in: memberIds } } });

    if (detailedData.originalData) {
      detailedData.originalData.members = detailedData.originalData.members.map((member) => {
        const user = users.find((usr) => usr.id === member.userId);
        return {
          ...user,
          ...member,
        };
      });
    }

    if (detailedData.requestData) {
      detailedData.requestData.members = detailedData.requestData.members.map((member) => {
        const user = users.find((usr) => usr.id === member.userId);
        return {
          ...user,
          ...member,
        };
      });
    }

    if (detailedData.decisionData) {
      detailedData.decisionData.members = detailedData.decisionData.members.map((member) => {
        const user = users.find((usr) => usr.id === member.userId);
        return {
          ...user,
          ...member,
        };
      });
    }
  }

  if (!hasProduct) {
    decoratedDoc._permissions = {
      view: true,
      edit: canEdit,
      review: canReview,
      signMou: canSignMou,
      reviewMou: canApproveMou,
      delete: false,
      viewProduct: false,
      cancel: canCancel,
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
    cancel: canCancel,
  };

  return decoratedDoc;
}

export const publicCloudRequestModel = createSessionModel<
  PublicCloudRequestSimple,
  PublicCloudRequestDetail,
  PublicCloudRequestSimpleDecorated,
  PublicCloudRequestDetailDecorated,
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
