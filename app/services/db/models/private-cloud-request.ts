import { Prisma, RequestType, DecisionStatus, TaskType, TaskStatus } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { PrivateCloudRequestDecorate } from '@/types/doc-decorate';
import {
  PrivateCloudRequestDetail,
  PrivateCloudRequestDetailDecorated,
  PrivateCloudRequestSimple,
  PrivateCloudRequestSimpleDecorated,
} from '@/types/private-cloud';
import { getUniqueNonFalsyItems } from '@/utils/collection';
import { privateCloudRequestDetailInclude, privateCloudRequestSimpleInclude } from '../includes';
import { createSessionModel } from './core';
import { privateCloudProductModel } from './private-cloud-product';

async function baseFilter(session: Session) {
  if (!session?.userId) return false;
  if (session.permissions.viewAllPrivateCloudProducts) return true;

  const { data: products } = await privateCloudProductModel.list({ select: { licencePlate: true } }, session);
  const licencePlates = products.map(({ licencePlate }) => licencePlate);

  const requestIdsFromTasks = session.tasks
    .filter(
      (task) =>
        ([TaskType.REVIEW_PRIVATE_CLOUD_REQUEST] as TaskType[]).includes(task.type) &&
        task.status === TaskStatus.ASSIGNED,
    )
    .map((task) => (task.data as { requestId: string }).requestId);

  const filter: Prisma.PrivateCloudRequestWhereInput = {
    OR: [
      { licencePlate: { in: licencePlates } },
      { id: { in: getUniqueNonFalsyItems([...requestIdsFromTasks]) } },
      { type: RequestType.CREATE, createdByEmail: { equals: session.user.email, mode: 'insensitive' } },
    ],
  };

  return filter;
}

async function decorate<T extends PrivateCloudRequestSimple | PrivateCloudRequestDetail>(
  doc: T,
  session: Session,
  detail: boolean,
) {
  const canReview =
    doc.decisionStatus === DecisionStatus.PENDING &&
    session.tasks
      .filter((task) => task.type === TaskType.REVIEW_PRIVATE_CLOUD_REQUEST && task.status === TaskStatus.ASSIGNED)
      .map((task) => (task.data as { requestId: string }).requestId)
      .includes(doc.id);

  const canEdit = canReview && doc.type !== RequestType.DELETE;
  const canResend =
    (doc.decisionStatus === DecisionStatus.APPROVED || doc.decisionStatus === DecisionStatus.AUTO_APPROVED) &&
    session.permissions.reviewAllPrivateCloudRequests;

  const hasProduct = doc.type !== RequestType.CREATE || doc.decisionStatus === DecisionStatus.PROVISIONED;

  const canViewDecision = doc.decisionStatus !== DecisionStatus.PENDING || canReview;

  const decoratedDoc = doc as T & PrivateCloudRequestDecorate;

  if (detail) {
    let memberIds = [];

    const detailedData = doc as never as PrivateCloudRequestDetail;
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
