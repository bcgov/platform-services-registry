import { faker } from '@faker-js/faker';
import { ProjectStatus, ResourceRequestsEnv } from '@/prisma/client';
import { PrivateCloudProductDetail } from '@/types/private-cloud';
import { generateShortId } from '@/utils/js';
import { getRandomOrganization, getRandomCluster, getRandomUser } from './core';

export const resourceRequests1 = {
  development: {
    cpu: 0.5,
    memory: 2,
    storage: 1,
    gpu: 0,
  },
  test: {
    cpu: 0.5,
    memory: 2,
    storage: 1,
    gpu: 0,
  },
  production: {
    cpu: 0.5,
    memory: 2,
    storage: 1,
    gpu: 0,
  },
  tools: {
    cpu: 0.5,
    memory: 2,
    storage: 1,
    gpu: 0,
  },
};

export const resourceRequests2 = {
  development: {
    cpu: 1,
    memory: 5,
    storage: 3,
    gpu: 0,
  },
  test: {
    cpu: 0.5,
    memory: 2,
    storage: 2,
    gpu: 0,
  },
  production: {
    cpu: 0.5,
    memory: 4,
    storage: 1,
    gpu: 0,
  },
  tools: {
    cpu: 0.5,
    memory: 2,
    storage: 1,
    gpu: 0,
  },
};

export type NormalizedPrivateCloudProductDetail = Omit<PrivateCloudProductDetail, 'resourceRequests'> & {
  resourceRequests: NormalizedResourceRequestsEnv;
};

export function createSamplePrivateCloudProduct(args?: {
  data?: Partial<PrivateCloudProductDetail>;
}): NormalizedPrivateCloudProductDetail {
  const { data } = args ?? {};

  const projectOwner = getRandomUser();
  const primaryTechnicalLead = getRandomUser();
  const secondaryTechnicalLead = getRandomUser();

  const organization = getRandomOrganization();

  const resourceRequests = normalizeResourceRequests(data?.resourceRequests ?? resourceRequests1);

  const product = {
    id: generateShortId(),
    licencePlate: faker.string.uuid().substring(0, 6),
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    status: ProjectStatus.ACTIVE,
    isTest: false,
    cluster: getRandomCluster(),
    projectOwnerId: projectOwner.id,
    projectOwner,
    primaryTechnicalLeadId: primaryTechnicalLead.id,
    primaryTechnicalLead,
    secondaryTechnicalLeadId: secondaryTechnicalLead.id,
    secondaryTechnicalLead,
    members: [],
    golddrEnabled: false,
    supportPhoneNumber: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: new Date(),
    temporaryProductNotificationDate: new Date(),
    requests: [],
    repositories: [],
    hasRepositories: null,
    activeRequest: null,
    organizationId: organization.id,
    organization: organization,
    ...data,
    resourceRequests,
  };

  return product;
}

export type NormalizedResourceRequestsEnv = {
  [K in keyof ResourceRequestsEnv]: Omit<ResourceRequestsEnv[K], 'gpu'> & {
    gpu: number;
  };
};

export function normalizeResourceRequests(resourceRequests: ResourceRequestsEnv): NormalizedResourceRequestsEnv {
  return {
    development: {
      ...resourceRequests.development,
      gpu: resourceRequests.development.gpu ?? 0,
    },
    test: {
      ...resourceRequests.test,
      gpu: resourceRequests.test.gpu ?? 0,
    },
    production: {
      ...resourceRequests.production,
      gpu: resourceRequests.production.gpu ?? 0,
    },
    tools: {
      ...resourceRequests.tools,
      gpu: resourceRequests.tools.gpu ?? 0,
    },
  };
}

export function normalizePrivateCloudProduct<T extends { resourceRequests: ResourceRequestsEnv }>(
  product: T,
): Omit<T, 'resourceRequests'> & {
  resourceRequests: NormalizedResourceRequestsEnv;
} {
  return {
    ...product,
    resourceRequests: normalizeResourceRequests(product.resourceRequests),
  };
}
