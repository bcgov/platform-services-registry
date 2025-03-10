import { faker } from '@faker-js/faker';
import { ministries, clusters, providers, reasonForSelectingCloudProviderOptions } from '@/constants';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { generateShortId, getRandomItem, getRandomNumberOptimally } from '@/utils/js';

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
    onboardingDate: null,
  };
};
export const getRandomCloudProviderSelectionReasons = () => {
  const reasonForSelectingCloudProviderArray = reasonForSelectingCloudProviderOptions.map((option) => option.value);
  const randomNumberOfReasons = getRandomNumberOptimally(1, reasonForSelectingCloudProviderArray.length);
  return faker.helpers.arrayElements(reasonForSelectingCloudProviderArray, randomNumberOfReasons);
};
export const getRandomProviderReasonsNote = () => {
  const maxCharactersForField = 1000;
  return faker.lorem.text().slice(0, getRandomNumberOptimally(1, maxCharactersForField));
};
