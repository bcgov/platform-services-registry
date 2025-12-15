import { defaultAccountCoding } from '@/constants';
import { PublicCloudBillingDetail } from '@/types/public-cloud';
import { generateShortId } from '@/utils/js';
import { getRandomUser } from './core';
import { getFaker } from './safe-faker';

const faker = getFaker();

export function createSamplePublicCloudBilling(args?: {
  data?: Partial<PublicCloudBillingDetail>;
}): PublicCloudBillingDetail {
  const { data } = args ?? {};

  const licencePlate = faker ? faker.string.uuid().substring(0, 6) : 'pcbill';
  const expenseAuthority = getRandomUser();
  const signedBy = getRandomUser();
  const approvedBy = getRandomUser();

  const billing = {
    id: generateShortId(),
    licencePlate,
    accountCoding: defaultAccountCoding,
    expenseAuthorityId: expenseAuthority.id,
    expenseAuthority,
    signed: true,
    signedAt: new Date(),
    signedById: signedBy.id,
    signedBy,
    approved: true,
    approvedAt: new Date(),
    approvedById: approvedBy.id,
    approvedBy,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  };

  return billing;
}
