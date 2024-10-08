import { faker } from '@faker-js/faker';
import { Prisma, Cluster, Provider } from '@prisma/client';
import {
  ministries,
  clusters,
  providers,
  cpuOptions,
  memoryOptions,
  storageOptions,
  reasonForSelectingCloudProviderOptions,
} from '@/constants';
import { findMockUserByIdr, mockNoRoleIdirs } from '@/helpers/mock-users';
import { getRandomItem } from '@/utils/collection';
import { getRandomNumberOptimally } from '@/utils/number';
import { generateShortId } from '@/utils/uuid';
import { getRandomCloudProviderSelectionReasons, getRandomProviderReasonsNote } from './mock-resources/core';

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

  const cluster = Cluster.SILVER;

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

  _data.golddrEnabled = _data.cluster === Cluster.GOLD ? getRandomBool() : false;

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
  const providerSelectionReasonsNote = getRandomProviderReasonsNote();
  const providerSelectionReasons = getRandomCloudProviderSelectionReasons();

  const _data = {
    licencePlate: faker.string.uuid().substring(0, 6),
    name: faker.string.alpha(10),
    description: faker.lorem.sentence(),
    provider,
    providerSelectionReasons,
    providerSelectionReasonsNote,
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

export function createSamplePrivateCloudCommentData(args?: { data?: Partial<Prisma.PrivateCloudCommentCreateInput> }) {
  const { data } = args ?? {};

  const _data = {
    text: faker.lorem.sentence(),
    userId: generateShortId(),
    projectId: generateShortId() as string | undefined,
    requestId: generateShortId() as string | undefined,
    ...data,
  };

  return _data;
}
