import { Prisma, ProjectContext, SonarScanResult } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { SonarScanResultDecorate } from '@/types/doc-decorate';
import { createSessionModel } from './core';
import { privateCloudProductModel } from './private-cloud-product';
import { publicCloudProductModel } from './public-cloud-product';

async function baseFilter(session: Session) {
  if (!session) return false;
  if (session.permissions.viewSonarscanResults) return true;

  const [{ data: privateProducts }, { data: publicProducts }] = await Promise.all([
    privateCloudProductModel.list({ select: { licencePlate: true } }, session),
    publicCloudProductModel.list({ select: { licencePlate: true } }, session),
  ]);

  const privateOR = privateProducts.map(({ licencePlate }) => ({
    licencePlate,
    context: ProjectContext.PRIVATE,
  }));
  const publicOR = publicProducts.map(({ licencePlate }) => ({ licencePlate, context: ProjectContext.PUBLIC }));

  const OR = [...privateOR, ...publicOR];

  if (OR.length === 0) return false;

  const filter: Prisma.SonarScanResultWhereInput = {
    OR,
  };

  return filter;
}

type SonarScanResultDecorated = SonarScanResult & SonarScanResultDecorate;

async function decorate(doc: SonarScanResult, session: Session) {
  const decoratedDoc = doc as SonarScanResultDecorated;
  decoratedDoc._permissions = {
    view: true,
    edit: false,
    delete: false,
  };

  return decoratedDoc;
}

export const sonarScanResultModel = createSessionModel<
  SonarScanResult,
  SonarScanResult,
  SonarScanResultDecorate,
  NonNullable<Parameters<typeof prisma.sonarScanResult.create>[0]>,
  NonNullable<Parameters<typeof prisma.sonarScanResult.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.sonarScanResult.update>[0]>,
  NonNullable<Parameters<typeof prisma.sonarScanResult.upsert>[0]>
>({
  model: prisma.sonarScanResult,
  baseFilter,
  decorate,
});
