import { Prisma, ProjectContext, SecurityConfig } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
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
  const query = { where: { licencePlate: doc.licencePlate } };

  const privateQuery = {
    ...query,
    select: { projectOwnerId: true, primaryTechnicalLeadId: true, secondaryTechnicalLeadId: true, cluster: true },
  };

  const publicQuery = {
    ...query,
    select: { projectOwnerId: true, primaryTechnicalLeadId: true, secondaryTechnicalLeadId: true, provider: true },
  };

  const project = await (doc.context === ProjectContext.PRIVATE
    ? privateCloudProductModel.get(privateQuery)
    : publicCloudProductModel.get(publicQuery));

  const projectWithPermissions = project as typeof project & {
    _permissions: { view: boolean; edit: boolean; delete: boolean };
  };

  const decoratedDoc = doc as SecurityConfigDecorated;

  decoratedDoc._permissions = {
    view: projectWithPermissions._permissions.view,
    edit: projectWithPermissions._permissions.edit,
    delete: false,
  };

  return decoratedDoc;
}

export const securityConfigModel = createSessionModel<
  SecurityConfig,
  SecurityConfig,
  SecurityConfigDecorate,
  NonNullable<Parameters<typeof prisma.securityConfig.create>[0]>,
  NonNullable<Parameters<typeof prisma.securityConfig.findFirst>[0]>,
  NonNullable<Parameters<typeof prisma.securityConfig.update>[0]>,
  NonNullable<Parameters<typeof prisma.securityConfig.upsert>[0]>
>({
  model: prisma.securityConfig,
  baseFilter,
  decorate,
});
