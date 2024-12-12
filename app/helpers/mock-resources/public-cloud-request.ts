import { faker } from '@faker-js/faker';
import { Prisma, Cluster, Provider, ProjectStatus, RequestType, DecisionStatus } from '@prisma/client';
import { deepClone } from 'valtio/utils';
import { PublicCloudRequestDetail } from '@/types/public-cloud';
import { generateShortId } from '@/utils/js';
import {
  getRandomMinistry,
  getRandomProvider,
  getRandomUser,
  getRandomProviderReasonsNote,
  getRandomCloudProviderSelectionReasons,
} from './core';

export function createSamplePublicCloudRequest(args?: {
  data?: Partial<PublicCloudRequestDetail>;
}): PublicCloudRequestDetail {
  const { data } = args ?? {};

  const projectOwner = getRandomUser();
  const primaryTechnicalLead = getRandomUser();
  const secondaryTechnicalLead = getRandomUser();
  const expenseAuthority = getRandomUser();

  const licencePlate = faker.string.uuid().substring(0, 6);
  const provider = getRandomProvider();
  const providerSelectionReasonsNote = getRandomProviderReasonsNote();
  const providerSelectionReasons = getRandomCloudProviderSelectionReasons();
  const ministry = getRandomMinistry();

  const accountCoding = '123456789876543212345678';
  const billing = {
    id: generateShortId(),
    code: `${accountCoding}_${provider}`,
    accountCoding,
    licencePlate,
    signed: true,
    signedAt: new Date(),
    signedById: expenseAuthority.id,
    signedBy: expenseAuthority,
    approved: true,
    approvedAt: new Date(),
    approvedById: projectOwner.id,
    approvedBy: projectOwner,
    expenseAuthorityId: expenseAuthority.id,
    expenseAuthority,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const baseData = {
    licencePlate,
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    status: ProjectStatus.ACTIVE,
    provider,
    providerSelectionReasons,
    providerSelectionReasonsNote,
    ministry,
    projectOwnerId: projectOwner.id,
    projectOwner,
    primaryTechnicalLeadId: primaryTechnicalLead.id,
    primaryTechnicalLead,
    secondaryTechnicalLeadId: secondaryTechnicalLead.id,
    secondaryTechnicalLead,
    expenseAuthorityId: expenseAuthority.id,
    expenseAuthority,
    members: [],
    billingId: billing.id,
    billing,
    budget: {
      dev: 0,
      test: 0,
      prod: 0,
      tools: 0,
    },
    environmentsEnabled: {
      development: true,
      test: true,
      production: true,
      tools: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const product = {
    ...baseData,
    id: generateShortId(),
  };

  const productData = {
    ...baseData,
    id: generateShortId(),
  };

  const createdBy = getRandomUser();
  const decisionMaker = getRandomUser();
  const quotaContact = getRandomUser();
  const request = {
    id: generateShortId(),
    licencePlate,
    createdByEmail: createdBy?.email,
    createdBy,
    decisionMakerEmail: decisionMaker?.email,
    decisionMaker,
    quotaContactName: quotaContact?.displayName,
    quotaContactEmail: quotaContact?.email,
    quotaJustification: faker.lorem.sentence(),
    type: RequestType.CREATE,
    decisionStatus: DecisionStatus.PENDING,
    isQuotaChanged: false,
    requestComment: faker.lorem.sentence(),
    decisionComment: faker.lorem.sentence(),
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    decisionDate: new Date(),
    provisionedDate: new Date(),
    projectId: product.id,
    project: product,
    decisionDataId: productData.id,
    decisionData: deepClone(productData),
    requestDataId: productData.id,
    requestData: deepClone(productData),
    originalDataId: productData.id,
    originalData: deepClone(productData),
    changes: null,
    ...data,
  };

  return request;
}
