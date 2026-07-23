import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { Prisma, ProjectContext, SecurityConfig } from '@/prisma/client';
import { SecurityConfigDecorate } from '@/types/doc-decorate';
import { createSessionModel } from './core';
import { privateCloudProductModel } from './private-cloud-product';
import { publicCloudProductModel } from './public-cloud-product';

async function baseFilter(session: Session) {
  if (!session) return false;
  if (session.isAdmin) return true;

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

  const filter: Prisma.SecurityConfigWhereInput = {
    OR,
  };

  return filter;
}

type SecurityConfigDecorated = SecurityConfig & SecurityConfigDecorate;

async function decorate(doc: SecurityConfig, session: Session) {
  const query = {
    where: {
      licencePlate: doc.licencePlate,
    },
  };

  const { data: project } =
    doc.context === ProjectContext.PRIVATE
      ? await privateCloudProductModel.get(query, session)
      : await publicCloudProductModel.get(query, session);

  const decoratedDoc = doc as SecurityConfigDecorated;

  decoratedDoc._permissions = {
    view: project?._permissions?.view ?? false,
    edit: project?._permissions?.edit ?? false,
    delete: false,
  };

  return decoratedDoc;
}

export const securityConfigModel = createSessionModel<
  SecurityConfig,
  SecurityConfig,
  SecurityConfigDecorated,
  SecurityConfigDecorated,
  NonNullable<Parameters<typeof prisma.securityConfig.create>[0]>,
  NonNullable<Parameters<typeof prisma.securityConfig.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.securityConfig.update>[0]>,
  NonNullable<Parameters<typeof prisma.securityConfig.upsert>[0]>
>({
  model: prisma.securityConfig,
  baseFilter,
  decorate,
});
