import { Prisma, ProjectContext, SonarScanResult } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { SonarScanResultDecorate } from '@/types/doc-decorate';
import { createSessionModel } from './core';
import { privateCloudProductModel } from './private-cloud-product';
import { publicCloudProductModel } from './public-cloud-product';

async function readFilter(session: Session) {
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

  const baseFilter: Prisma.SonarScanResultWhereInput = {
    OR,
  };

  return baseFilter;
}

async function writeFilter(session: Session) {
  return false;
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
  SonarScanResultDecorated,
  SonarScanResult,
  SonarScanResultDecorated,
  NonNullable<Parameters<typeof prisma.sonarScanResult.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.sonarScanResult.upsert>[0]>
>({
  model: prisma.sonarScanResult,
  readFilter,
  decorate,
});
