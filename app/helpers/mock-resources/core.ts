import { clusters, providers, reasonForSelectingCloudProviderOptions, sampleMinistries } from '@/constants';
import { mockNoRoleUsers } from '@/helpers/mock-users';
import { generateShortId, getRandomItem, getRandomNumberOptimally } from '@/utils/js';
import { getFaker } from './safe-faker';

const faker = getFaker();

export const getRandomBool = () => (faker ? faker.helpers.arrayElement([true, false]) : Math.random() < 0.5);

export const getRandomMinistry = () =>
  faker
    ? faker.helpers.arrayElement(sampleMinistries.map((m) => m.code))
    : getRandomItem(sampleMinistries.map((m) => m.code));

export const getRandomOrganization = () =>
  faker ? faker.helpers.arrayElement(sampleMinistries.map((m) => m)) : getRandomItem(sampleMinistries.map((m) => m));

export const getRandomCluster = () => (faker ? faker.helpers.arrayElement(clusters) : getRandomItem(clusters));

export const getRandomProvider = () => (faker ? faker.helpers.arrayElement(providers) : getRandomItem(providers));

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
  const values = reasonForSelectingCloudProviderOptions.map((o) => o.value);

  if (!faker) {
    const randomNumberOfReasons = getRandomNumberOptimally(1, values.length);
    const result = new Set<string>();
    while (result.size < randomNumberOfReasons) {
      result.add(getRandomItem(values));
    }
    return [...result];
  }

  const randomNumberOfReasons = getRandomNumberOptimally(1, values.length);
  return faker.helpers.arrayElements(values, randomNumberOfReasons);
};

export const getRandomProviderReasonsNote = () => {
  const maxCharactersForField = 1000;
  if (!faker) return 'Reason for selecting this cloud provider';
  return faker.lorem.text().slice(0, getRandomNumberOptimally(1, maxCharactersForField));
};
