import { faker } from '@faker-js/faker';
import { Prisma, Cluster } from '@prisma/client';
import jws from 'jws';
import _join from 'lodash-es/join';
import { ministries, clusters, providers } from '@/constants';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { AppUserWithRoles } from '@/types/user';
import { generateShortId } from '@/utils/js';
import { getRandomCloudProviderSelectionReasons, getRandomProviderReasonsNote } from './mock-resources/core';
import { resourceRequests1 } from './mock-resources/private-cloud-product';

const getRandomBool = () => faker.helpers.arrayElement([true, false]);
const getRandomMinistry = () => faker.helpers.arrayElement(ministries);
const getRandomCluster = () => faker.helpers.arrayElement(clusters);
const getRandomProvider = () => faker.helpers.arrayElement(providers);
const userSecret = 'testsecret'; // pragma: allowlist secret

export function createSamplePrivateCloudProductData(args?: {
  data?: Partial<
    Prisma.PrivateCloudProductGetPayload<null> & {
      projectOwner: any;
      primaryTechnicalLead: any;
      secondaryTechnicalLead: any;
    }
  >;
}) {
  const { data } = args ?? {};

  const cluster = Cluster.SILVER;

  const PO = mockNoRoleUsers[0];
  const TL1 = mockNoRoleUsers[1];
  const TL2 = mockNoRoleUsers[2];

  const _data = {
    licencePlate: faker.string.uuid().substring(0, 6),
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    cluster,
    ministry: getRandomMinistry(),
    projectOwner: PO,
    primaryTechnicalLead: TL1,
    secondaryTechnicalLead: TL2,
    resourceRequests: resourceRequests1,
    isTest: false,
    isAgMinistryChecked: true,
    ...data,
  };

  _data.golddrEnabled = _data.cluster === Cluster.GOLD ? getRandomBool() : false;

  return _data;
}

export function createSamplePublicCloudProductData(args?: {
  data?: Partial<
    Prisma.PublicCloudProductGetPayload<null> & {
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

  const PO = mockNoRoleUsers[0];
  const TL1 = mockNoRoleUsers[1];
  const TL2 = mockNoRoleUsers[2];
  const EA = mockNoRoleUsers[3];

  const _data = {
    licencePlate: faker.string.uuid().substring(0, 6),
    name: faker.string.alpha(10),
    description: faker.lorem.sentence(),
    provider,
    providerSelectionReasons,
    providerSelectionReasonsNote,
    ministry: getRandomMinistry(),
    projectOwner: PO,
    primaryTechnicalLead: TL1,
    secondaryTechnicalLead: TL2,
    expenseAuthority: EA,
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
    isAgMinistryChecked: true,
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

export function generateTestJwt(user?: AppUserWithRoles) {
  const stringifiedRoles = _join(user?.roles, ',');
  return jws.sign({
    header: { alg: 'HS256', typ: 'JWT' },
    payload: {
      roles: stringifiedRoles,
      service_account_type: 'user',
      'kc-userid': user?.id,
    },
    secret: userSecret,
  });
}

export function getTestAuthHeader(user?: AppUserWithRoles) {
  const signature = generateTestJwt(user);
  return {
    Authorization: 'Bearer ' + signature,
    'Content-Type': 'application/json',
  };
}
