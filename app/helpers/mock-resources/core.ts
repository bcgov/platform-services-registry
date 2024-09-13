import { faker } from '@faker-js/faker';
import { clusters, ministries, providers } from '@/constants';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { getRandomItem } from '@/utils/collection';
import { generateShortId } from '@/utils/uuid';

export const getRandomBool = () => faker.helpers.arrayElement([true, false]);
export const getRandomMinistry = () => faker.helpers.arrayElement(ministries);
export const getRandomCluster = () => faker.helpers.arrayElement(clusters);
export const getRandomProvider = () => faker.helpers.arrayElement(providers);
export const getRandomUser = () => {
  const { roles, ...randomUser } = getRandomItem(mockNoRoleUsers);
  return {
    ...randomUser,
    id: generateShortId(),
    image: '',
    archived: false,
    updatedAt: new Date(),
    lastSeen: new Date(),
    createdAt: new Date(),
  };
};
