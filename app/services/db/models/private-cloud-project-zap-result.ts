import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { Prisma, PrivateCloudProductZapResult } from '@/prisma/client';
import { PrivateCloudProductZapResultDecorate } from '@/types/doc-decorate';
import { createSessionModel } from './core';
import { privateCloudProductModel } from './private-cloud-product';

async function baseFilter(session: Session) {
  if (!session) return false;
  if (session.permissions.viewZapscanResults) return true;

  const { data: products } = await privateCloudProductModel.list(
    {
      select: { cluster: true, licencePlate: true },
    },
    session,
  );

  if (products.length === 0) return false;

  const filter: Prisma.PrivateCloudProductZapResultWhereInput = {
    OR: products.map(({ cluster, licencePlate }) => ({ cluster, licencePlate })),
  };

  return filter;
}

type PrivateCloudProductZapResultDecorated = PrivateCloudProductZapResult & PrivateCloudProductZapResultDecorate;

async function decorate(doc: PrivateCloudProductZapResult, session: Session) {
  const decoratedDoc = doc as PrivateCloudProductZapResultDecorated;
  decoratedDoc._permissions = {
    view: true,
    edit: false,
    delete: false,
  };

  return decoratedDoc;
}

export const privateCloudProductZapResultModel = createSessionModel<
  PrivateCloudProductZapResult,
  PrivateCloudProductZapResult,
  PrivateCloudProductZapResultDecorated,
  PrivateCloudProductZapResultDecorated,
  NonNullable<Parameters<typeof prisma.privateCloudProductZapResult.create>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudProductZapResult.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudProductZapResult.update>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudProductZapResult.upsert>[0]>
>({
  model: prisma.privateCloudProductZapResult,
  baseFilter,
  decorate,
});
