import { randomBytes } from 'crypto';
import { faker } from '@faker-js/faker';
import { Prisma, $Enums } from '@prisma/client';
import { clusters, ministries, providers } from '@/constants';
import { findMockUserByIDIR, generateTestSession, proxyNoRoleIDIRs } from '@/helpers/mock-users';
import { cpuOptions, memoryOptions, storageOptions } from '@/schema';

function getRandomItem<T>(arr: T[]): T {
  const randomBytesBuffer = randomBytes(4);
  const randomValue = randomBytesBuffer.readUInt32BE(0);
  const randomIndex = randomValue % arr.length;
  return arr[randomIndex];
}

function getRandomBool() {
  return getRandomItem<boolean>([true, false]);
}

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

  const cluster = getRandomItem<$Enums.Cluster>(clusters);

  const quota = {
    cpu: cpuOptions[0],
    memory: memoryOptions[0],
    storage: storageOptions[0],
  };

  const _data = {
    licencePlate: faker.string.uuid().substring(0, 6),
    name: faker.company.name(),
    description: faker.company.buzzPhrase(),
    cluster,
    ministry: getRandomItem(ministries),
    projectOwner: findMockUserByIDIR(getRandomItem(proxyNoRoleIDIRs)),
    primaryTechnicalLead: findMockUserByIDIR(getRandomItem(proxyNoRoleIDIRs)),
    secondaryTechnicalLead: findMockUserByIDIR(getRandomItem(proxyNoRoleIDIRs)),
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

  _data.golddrEnabled = cluster === $Enums.Cluster.GOLD ? getRandomBool() : false;

  return _data;
}

export function createSamplePrivateCloudRequestData(args?: {
  product?: Prisma.PrivateCloudProjectGetPayload<null>;
  data?: Partial<
    Prisma.PrivateCloudProjectGetPayload<null> & {
      projectOwner: any;
      primaryTechnicalLead: any;
      secondaryTechnicalLead: any;
    }
  >;
}) {
  const { product = {}, data } = args ?? {};
  const newProduct = createSamplePrivateCloudProductData({ data });

  const _data = {
    ...newProduct,
    ...product,
    ...data,
  };

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

  const provider = getRandomItem<$Enums.Provider>(providers);

  const _data = {
    licencePlate: faker.string.uuid().substring(0, 6),
    name: faker.string.alpha(10),
    description: faker.company.buzzPhrase(),
    provider,
    ministry: getRandomItem(ministries),
    projectOwner: findMockUserByIDIR(getRandomItem(proxyNoRoleIDIRs)),
    primaryTechnicalLead: findMockUserByIDIR(getRandomItem(proxyNoRoleIDIRs)),
    secondaryTechnicalLead: findMockUserByIDIR(getRandomItem(proxyNoRoleIDIRs)),
    expenseAuthority: findMockUserByIDIR(getRandomItem(proxyNoRoleIDIRs)),
    accountCoding: '111222223333344445555555',
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

export function createSamplePublicCloudRequestData(args?: {
  product?: Prisma.PublicCloudProjectGetPayload<null>;
  data?: Partial<
    Prisma.PublicCloudProjectGetPayload<null> & {
      projectOwner: any;
      primaryTechnicalLead: any;
      secondaryTechnicalLead: any;
      expenseAuthority: any;
    }
  >;
}) {
  const { product = {}, data } = args ?? {};
  const newProduct = createSamplePublicCloudProductData({ data });

  const _data = {
    ...newProduct,
    ...product,
    ...data,
  };

  return _data;
}
