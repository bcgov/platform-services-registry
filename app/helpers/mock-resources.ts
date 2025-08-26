import { faker } from '@faker-js/faker';
import jws from 'jws';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { SERVICE_ACCOUNT_DATA } from '@/jest.mock';
import { Prisma, Cluster } from '@/prisma/client';
import { AppUserWithRoles } from '@/types/user';
import { generateShortId } from '@/utils/js';
import {
  getRandomBool,
  getRandomOrganization,
  getRandomProvider,
  getRandomCloudProviderSelectionReasons,
  getRandomProviderReasonsNote,
} from './mock-resources/core';
import { resourceRequests1 } from './mock-resources/private-cloud-product';

const secret = 'testsecret'; // pragma: allowlist secret

export function createSamplePrivateCloudProductData(args?: {
  data?: Partial<
    Prisma.PrivateCloudProductGetPayload<null> & {
      projectOwner: AppUserWithRoles;
      primaryTechnicalLead: AppUserWithRoles;
      secondaryTechnicalLead: AppUserWithRoles;
    }
  >;
}) {
  const { data } = args ?? {};

  const cluster = Cluster.SILVER;
  const organization = getRandomOrganization();

  const PO = mockNoRoleUsers[0];
  const TL1 = mockNoRoleUsers[1];
  const TL2 = mockNoRoleUsers[2];

  const _data = {
    licencePlate: faker.string.uuid().substring(0, 6),
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    cluster,
    projectOwner: PO,
    primaryTechnicalLead: TL1,
    secondaryTechnicalLead: TL2,
    resourceRequests: resourceRequests1,
    isTest: false,
    isAgMinistry: false,
    isAgMinistryChecked: true,
    organizationId: organization.id,
    organization,
    ...data,
  };

  _data.golddrEnabled = _data.cluster === Cluster.GOLD ? getRandomBool() : false;

  return _data;
}

export function createSamplePublicCloudProductData(args?: {
  data?: Partial<
    Prisma.PublicCloudProductGetPayload<null> & {
      projectOwner: AppUserWithRoles;
      primaryTechnicalLead: AppUserWithRoles;
      secondaryTechnicalLead: AppUserWithRoles;
      expenseAuthority: AppUserWithRoles;
    }
  >;
}) {
  const { data } = args ?? {};

  const provider = getRandomProvider();
  const providerSelectionReasonsNote = getRandomProviderReasonsNote();
  const providerSelectionReasons = getRandomCloudProviderSelectionReasons();
  const organization = getRandomOrganization();

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
    isAgMinistry: false,
    isAgMinistryChecked: true,
    organizationId: organization.id,
    organization: organization,
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
export function getServiceAccountAuthHeader() {
  let payload = {};
  if (SERVICE_ACCOUNT_DATA.user) {
    payload = {
      service_account_type: 'user',
      'kc-userid': 'PLACEHOLDER',
    };
  } else if (SERVICE_ACCOUNT_DATA.team) {
    payload = {
      service_account_type: 'team',
      roles: SERVICE_ACCOUNT_DATA.team.roles.join(','),
    };
  }

  const signature = jws.sign({
    header: { alg: 'HS256', typ: 'JWT' },
    payload,
    secret,
  });

  return {
    Authorization: 'Bearer ' + signature,
    'Content-Type': 'application/json',
  };
}
