import { faker } from '@faker-js/faker';
import { Prisma, ProjectStatus, CPU, Memory, Storage } from '@prisma/client';
import { PrivateCloudProductDetail } from '@/types/private-cloud';
import { generateShortId } from '@/utils/uuid';
import { getRandomMinistry, getRandomCluster, getRandomUser } from './core';

export function createSamplePrivateCloudProduct(args?: {
  data?: Partial<PrivateCloudProductDetail>;
}): PrivateCloudProductDetail {
  const { data } = args ?? {};

  const quota = {
    cpu: CPU.CPU_REQUEST_0_5_LIMIT_1_5,
    memory: Memory.MEMORY_REQUEST_2_LIMIT_4,
    storage: Storage.STORAGE_1,
  };

  const commonComponents = {
    addressAndGeolocation: {
      planningToUse: true,
      implemented: false,
    },
    workflowManagement: {
      planningToUse: false,
      implemented: true,
    },
    formDesignAndSubmission: {
      planningToUse: true,
      implemented: false,
    },
    identityManagement: {
      planningToUse: false,
      implemented: false,
    },
    paymentServices: {
      planningToUse: true,
      implemented: false,
    },
    documentManagement: {
      planningToUse: false,
      implemented: true,
    },
    endUserNotificationAndSubscription: {
      planningToUse: true,
      implemented: false,
    },
    publishing: {
      planningToUse: false,
      implemented: true,
    },
    businessIntelligence: {
      planningToUse: true,
      implemented: false,
    },
    other: 'Some other services',
    noServices: false,
  };

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
    developmentQuota: quota,
    testQuota: quota,
    productionQuota: quota,
    toolsQuota: quota,
    commonComponents: commonComponents,
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
