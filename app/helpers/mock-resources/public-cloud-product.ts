import { faker } from '@faker-js/faker';
import { ProjectStatus } from '@/prisma/client';
import { PublicCloudProductDetail } from '@/types/public-cloud';
import { generateShortId } from '@/utils/js';
import {
  getRandomCloudProviderSelectionReasons,
  getRandomMinistry,
  getRandomProvider,
  getRandomProviderReasonsNote,
  getRandomUser,
} from './core';

export function createSamplePublicCloudProduct(args?: {
  data?: Partial<PublicCloudProductDetail>;
}): PublicCloudProductDetail {
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

  const product = {
    id: generateShortId(),
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
    requests: [],
    activeRequest: null,
    ...data,
  };

  return product;
}
