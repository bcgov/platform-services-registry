import { faker } from '@faker-js/faker';
import { ProjectStatus } from '@prisma/client';
import { PrivateCloudProductDetail } from '@/types/private-cloud';
import { generateShortId } from '@/utils/js';
import { getRandomMinistry, getRandomCluster, getRandomUser } from './core';

export const resourceRequests1 = {
  development: {
    cpu: 0.5,
    memory: 2,
    storage: 1,
  },
  test: {
    cpu: 0.5,
    memory: 2,
    storage: 1,
  },
  production: {
    cpu: 0.5,
    memory: 2,
    storage: 1,
  },
  tools: {
    cpu: 0.5,
    memory: 2,
    storage: 1,
  },
};

export const resourceRequests2 = {
  development: {
    cpu: 1,
    memory: 5,
    storage: 3,
  },
  test: {
    cpu: 0.5,
    memory: 2,
    storage: 2,
  },
  production: {
    cpu: 0.5,
    memory: 4,
    storage: 1,
  },
  tools: {
    cpu: 0.5,
    memory: 2,
    storage: 1,
  },
};

export function createSamplePrivateCloudProduct(args?: {
  data?: Partial<PrivateCloudProductDetail>;
}): PrivateCloudProductDetail {
  const { data } = args ?? {};

  const projectOwner = getRandomUser();
  const primaryTechnicalLead = getRandomUser();
  const secondaryTechnicalLead = getRandomUser();

  const product = {
    id: generateShortId(),
    licencePlate: faker.string.uuid().substring(0, 6),
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    status: ProjectStatus.ACTIVE,
    isTest: false,
    cluster: getRandomCluster(),
    ministry: getRandomMinistry(),
    projectOwnerId: projectOwner.id,
    projectOwner,
    primaryTechnicalLeadId: primaryTechnicalLead.id,
    primaryTechnicalLead,
    secondaryTechnicalLeadId: secondaryTechnicalLead.id,
    secondaryTechnicalLead,
    members: [],
    resourceRequests: resourceRequests1,
    golddrEnabled: false,
    supportPhoneNumber: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    temporaryProductNotificationDate: new Date(),
    requests: [],
    activeRequest: null,
    ...data,
  };

  return product;
}
