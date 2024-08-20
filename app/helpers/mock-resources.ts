import { faker } from '@faker-js/faker';
import { Prisma, Cluster, Provider } from '@prisma/client';
import { clusters, ministries, providers } from '@/constants';
import { findMockUserByIdr, mockNoRoleIdirs } from '@/helpers/mock-users';
import { cpuOptions, memoryOptions, storageOptions } from '@/schema';
import { getRandomItem } from '@/utils/collection';

const getRandomBool = () => faker.helpers.arrayElement([true, false]);
const getRandomMinistry = () => faker.helpers.arrayElement(ministries);
const getRandomCluster = () => faker.helpers.arrayElement(clusters);
const getRandomProvider = () => faker.helpers.arrayElement(providers);

export function createSamplePrivateCloudProductData(args?: {
  data?: Partial<
    Prisma.PrivateCloudProjectGetPayload<null> & {
      projectOwner: any;
      primaryTechnicalLead: any;
      secondaryTechnicalLead: any;
    }
  >;
}) {
  const { data } = args ?? {};

  const cluster = getRandomCluster();

  const quota = {
    cpu: cpuOptions[0],
    memory: memoryOptions[0],
    storage: storageOptions[0],
  };

  const _data = {
    licencePlate: faker.string.uuid().substring(0, 6),
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    cluster,
    ministry: getRandomMinistry(),
    projectOwner: findMockUserByIdr(getRandomItem(mockNoRoleIdirs)),
    primaryTechnicalLead: findMockUserByIdr(getRandomItem(mockNoRoleIdirs)),
    secondaryTechnicalLead: findMockUserByIdr(getRandomItem(mockNoRoleIdirs)),
    productionQuota: quota,
    toolsQuota: quota,
    developmentQuota: quota,
    commonComponents: {
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
    },
    isTest: getRandomBool(),
    ...data,
  };

  _data.golddrEnabled = cluster === Cluster.GOLD ? getRandomBool() : false;

  return _data;
}

export function createSamplePublicCloudProductData(args?: {
  data?: Partial<
    Prisma.PublicCloudProjectGetPayload<null> & {
      projectOwner: any;
      primaryTechnicalLead: any;
      secondaryTechnicalLead: any;
      expenseAuthority: any;
    }
  >;
}) {
  const { data } = args ?? {};

  const provider = getRandomProvider();

  const _data = {
    licencePlate: faker.string.uuid().substring(0, 6),
    name: faker.string.alpha(10),
    description: faker.lorem.sentence(),
    provider,
    ministry: getRandomMinistry(),
    projectOwner: findMockUserByIdr(getRandomItem(mockNoRoleIdirs)),
    primaryTechnicalLead: findMockUserByIdr(getRandomItem(mockNoRoleIdirs)),
    secondaryTechnicalLead: findMockUserByIdr(getRandomItem(mockNoRoleIdirs)),
    expenseAuthority: findMockUserByIdr(getRandomItem(mockNoRoleIdirs)),
    accountCoding: faker.string.numeric(24),
    budget: {
      dev: 50,
      test: 50,
      prod: 50,
      tools: 50,
    },
    environmentsEnabled: {
      production: true,
      test: true,
      development: true,
      tools: true,
    },
    ...data,
  };

  return _data;
}
