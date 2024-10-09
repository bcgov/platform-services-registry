import { Prisma, PrivateCloudProjectZapResult } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { privateCloudProductModel } from '@/services/db';
import { PrivateCloudProductZapResultDecorate } from '@/types/doc-decorate';
import { createSessionModel } from './core';

async function readFilter(session: Session) {
  if (!session) return false;
  if (session.permissions.viewZapscanResults) return true;

  const { data: products } = await privateCloudProductModel.list(
    {
      select: { cluster: true, licencePlate: true },
    },
    session,
  );

  if (products.length === 0) return false;

  const baseFilter: Prisma.PrivateCloudProjectZapResultWhereInput = {
    OR: products.map(({ cluster, licencePlate }) => ({ cluster, licencePlate })),
  };

  return baseFilter;
}

async function writeFilter(session: Session) {
  return false;
}

type PrivateCloudProjectZapResultDecorated = PrivateCloudProjectZapResult & PrivateCloudProductZapResultDecorate;

async function decorate(doc: PrivateCloudProjectZapResult, session: Session) {
  const decoratedDoc = doc as PrivateCloudProjectZapResultDecorated;
  decoratedDoc._permissions = {
    view: true,
    edit: false,
    delete: false,
  };

  return decoratedDoc;
}

export const privateCloudProductZapResultModel = createSessionModel<
  PrivateCloudProjectZapResult,
  PrivateCloudProjectZapResultDecorated,
  PrivateCloudProjectZapResult,
  PrivateCloudProjectZapResultDecorated,
  NonNullable<Parameters<typeof prisma.privateCloudProjectZapResult.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.privateCloudProjectZapResult.upsert>[0]>
>({
  model: prisma.privateCloudProjectZapResult,
  readFilter,
  decorate,
});
