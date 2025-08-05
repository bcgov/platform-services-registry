import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { Prisma, PublicCloudProductMemberRole, RequestType, TaskType } from '@/prisma/client';
import { PublicCloudBillingDecorate } from '@/types/doc-decorate';
import {
  PublicCloudBillingDetail,
  PublicCloudBillingSimple,
  PublicCloudBillingDetailDecorated,
  PublicCloudBillingSimpleDecorated,
} from '@/types/public-cloud';
import { getUniqueNonFalsyItems } from '@/utils/js';
import { publicCloudBillingDetailInclude, publicCloudBillingSimpleInclude } from '../includes';
import { createSessionModel } from './core';

async function baseFilter(session: Session) {
  if (!session?.user.id) return false;
  if (session.permissions.viewPublicCloudBilling) return true;

  const licencePlatesFromTasks = session.tasks
    .filter((task) =>
      ([TaskType.SIGN_PUBLIC_CLOUD_MOU, TaskType.REVIEW_PUBLIC_CLOUD_MOU] as TaskType[]).includes(task.type),
    )
    .map((task) => (task.data as { licencePlate: string }).licencePlate);

  const productFilters: Prisma.PublicCloudProductWhereInput[] = [
    { projectOwnerId: session.user.id },
    { primaryTechnicalLeadId: session.user.id },
    { secondaryTechnicalLeadId: session.user.id },
    { expenseAuthorityId: session.user.id },
    {
      members: {
        some: {
          userId: session.user.id,
          roles: {
            hasSome: [PublicCloudProductMemberRole.EDITOR, PublicCloudProductMemberRole.VIEWER],
          },
        },
      },
    },
  ];

  const requestFilters: Prisma.PublicCloudRequestWhereInput[] = [
    {
      type: RequestType.CREATE,
      createdById: session.user.id,
    },
    {
      type: RequestType.CREATE,
      decisionData: { projectOwnerId: session.user.id },
    },
    {
      type: RequestType.CREATE,
      decisionData: { primaryTechnicalLeadId: session.user.id },
    },
    {
      type: RequestType.CREATE,
      decisionData: { secondaryTechnicalLeadId: session.user.id },
    },
    {
      type: RequestType.CREATE,
      decisionData: { expenseAuthorityId: session.user.id },
    },
  ];

  const [products, requests] = await Promise.all([
    prisma.publicCloudProduct.findMany({
      where: { OR: productFilters },
      select: { licencePlate: true },
    }),
    prisma.publicCloudRequest.findMany({
      where: { OR: requestFilters },
      select: { licencePlate: true },
    }),
  ]);

  const productLicencePlates = products.map(({ licencePlate }) => licencePlate);
  const requestLicencePlates = requests.map(({ licencePlate }) => licencePlate);

  const filter: Prisma.PublicCloudBillingWhereInput = {
    OR: [
      {
        licencePlate: {
          in: getUniqueNonFalsyItems([...productLicencePlates, ...requestLicencePlates, ...licencePlatesFromTasks]),
        },
      },
      {
        expenseAuthorityId: session.user.id,
      },
    ],
  };

  return filter;
}

async function decorate<T extends PublicCloudBillingSimple | PublicCloudBillingDetail>(doc: T, session: Session) {
  const decoratedDoc = doc as T & PublicCloudBillingDecorate;
  decoratedDoc._permissions = {
    view: true,
    edit: doc.signed && !doc.approved && doc.expenseAuthorityId === session.user.id,
    delete: false,
  };

  return decoratedDoc;
}

export const publicCloudBillingModel = createSessionModel<
  PublicCloudBillingSimple,
  PublicCloudBillingDetail,
  PublicCloudBillingSimpleDecorated,
  PublicCloudBillingDetailDecorated,
  NonNullable<Parameters<typeof prisma.publicCloudBilling.create>[0]>,
  NonNullable<Parameters<typeof prisma.publicCloudBilling.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.publicCloudBilling.update>[0]>,
  NonNullable<Parameters<typeof prisma.publicCloudBilling.upsert>[0]>
>({
  model: prisma.publicCloudBilling,
  includeDetail: publicCloudBillingDetailInclude,
  includeSimple: publicCloudBillingSimpleInclude,
  baseFilter,
  decorate,
});
