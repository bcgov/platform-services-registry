import { deepClone } from 'valtio/utils';
import { ProjectStatus, RequestType, DecisionStatus } from '@/prisma/client';
import { PublicCloudRequestDetail } from '@/types/public-cloud';
import { generateShortId } from '@/utils/js';
import {
  getRandomProvider,
  getRandomUser,
  getRandomProviderReasonsNote,
  getRandomCloudProviderSelectionReasons,
  getRandomOrganization,
} from './core';
import { getFaker } from './safe-faker';

const faker = getFaker();

export function createSamplePublicCloudRequest(args?: {
  data?: Partial<PublicCloudRequestDetail>;
}): PublicCloudRequestDetail {
  const { data } = args ?? {};

  const projectOwner = getRandomUser();
  const primaryTechnicalLead = getRandomUser();
  const secondaryTechnicalLead = getRandomUser();
  const expenseAuthority = getRandomUser();

  const licencePlate = faker ? faker.string.uuid().substring(0, 6) : 'pub123';
  const provider = getRandomProvider();
  const providerSelectionReasonsNote = getRandomProviderReasonsNote();
  const providerSelectionReasons = getRandomCloudProviderSelectionReasons();
  const organization = getRandomOrganization();

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
    name: faker ? faker.company.name() : 'Sample Public Cloud Project',
    description: faker ? faker.lorem.sentence() : 'Sample public cloud project description',
    status: ProjectStatus.ACTIVE,
    provider,
    providerSelectionReasons,
    providerSelectionReasonsNote,
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
    archivedAt: new Date(),
    organizationId: organization.id,
    organization: organization,
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
    createdById: createdBy?.id,
    createdBy,
    decisionMakerId: decisionMaker?.id,
    decisionMaker,
    quotaContactName: quotaContact?.displayName,
    quotaContactEmail: quotaContact?.email,
    quotaJustification: faker ? faker.lorem.sentence() : 'Sample quota justification',
    type: RequestType.CREATE,
    decisionStatus: DecisionStatus.PENDING,
    isQuotaChanged: false,
    requestComment: faker ? faker.lorem.sentence() : 'Sample request comment',
    decisionComment: faker ? faker.lorem.sentence() : 'Sample decision comment',
    active: true,
    actioned: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    decisionDate: new Date(),
    provisionedDate: new Date(),
    cancelledAt: null,
    cancelledById: null,
    cancelledBy: null,
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
