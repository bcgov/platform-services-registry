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

  const billingRecords = await prisma.publicCloudBilling.findMany({
    where: {
      expenseAuthority: {
        id: session.user.id,
      },
      signed: true,
      approved: false,
    },
    select: {
      licencePlate: true,
    },
  });

  const licencePlatesAsEa = billingRecords.map((b) => b.licencePlate);

  const filter: Prisma.PublicCloudRequestWhereInput = {
    OR: [
      {
        licencePlate: {
          in: getUniqueNonFalsyItems([...licencePlates, ...licencePlatesFromTasks, ...licencePlatesAsEa]),
        },
      },
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
  let canEditAsEa = false;

  if (doc.decisionStatus === DecisionStatus.PENDING) {
    if (doc.type === RequestType.CREATE) {
      const billing = await prisma.publicCloudBilling.findFirst({
        where: { licencePlate: doc.licencePlate },
        include: { expenseAuthority: true },
        orderBy: { createdAt: Prisma.SortOrder.desc },
      });

      if (billing) {
        canSignMou =
          !billing.signed &&
          session.tasks
            .filter((task) => task.type === TaskType.SIGN_PUBLIC_CLOUD_MOU && task.status === TaskStatus.ASSIGNED)
            .map((task) => (task.data as { licencePlate: string }).licencePlate)
            .includes(doc.licencePlate);

        canApproveMou =
          billing.signed &&
          !billing.approved &&
          session.tasks
            .filter((task) => task.type === TaskType.REVIEW_PUBLIC_CLOUD_MOU && task.status === TaskStatus.ASSIGNED)
            .map((task) => (task.data as { licencePlate: string }).licencePlate)
            .includes(doc.licencePlate);

        canReview =
          doc.decisionStatus === DecisionStatus.PENDING &&
          billing.signed &&
          billing.approved &&
          session.tasks
            .filter((task) => task.type === TaskType.REVIEW_PUBLIC_CLOUD_REQUEST && task.status === TaskStatus.ASSIGNED)
            .map((task) => (task.data as { requestId: string }).requestId)
            .includes(doc.id);

        canEditAsEa = billing.signed && !billing.approved && billing.expenseAuthority?.id === session.user.id;
      }
    } else if (doc.type === RequestType.DELETE) {
      canReview =
        doc.decisionStatus === DecisionStatus.PENDING &&
        session.tasks
          .filter((task) => task.type === TaskType.REVIEW_PUBLIC_CLOUD_REQUEST && task.status === TaskStatus.ASSIGNED)
          .map((task) => (task.data as { requestId: string }).requestId)
          .includes(doc.id);
    }
  }

  const canCancel = doc.decisionStatus === DecisionStatus.PENDING && session.user.email === doc.createdBy?.email;
  const canEdit = (canReview && doc.type !== RequestType.DELETE) || canEditAsEa;

  const canResend =
    (doc.decisionStatus === DecisionStatus.APPROVED || doc.decisionStatus === DecisionStatus.AUTO_APPROVED) &&
    session.permissions.reviewAllPublicCloudRequests;

  const hasProduct = doc.type !== RequestType.CREATE || doc.decisionStatus === DecisionStatus.PROVISIONED;

  const decoratedDoc = doc as T & PublicCloudRequestDecorate;

  if (detail) {
    let memberIds: string[] = [];

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
      resend: canResend,
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
    resend: canResend,
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
