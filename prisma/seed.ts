import { Cluster, Ministry, PrismaClient, Provider } from '@prisma/client';
import { DefaultCpuOptionsSchema, DefaultMemoryOptionsSchema, DefaultStorageOptionsSchema } from '../schema';
const prisma = new PrismaClient();
import { faker } from '@faker-js/faker';

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
    implemented: true,
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

async function main() {
  const numOfUsers = 10; // Number of users to create
  const numOfProjectsPerUser = 5; // Number of projects per user

  for (let i = 0; i < numOfUsers; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;

    // Create fake user
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        firstName: firstName,
        lastName: firstName,
        image: 'avatar.png',
        ministry: faker.helpers.arrayElement(Object.values(Ministry)),
        archived: false,
        created: faker.date.past(),
        lastSeen: faker.date.recent(),
      },
    });

    // Create fake public cloud project for the user
    for (let j = 0; j < numOfProjectsPerUser; j++) {
      await prisma.publicCloudProject.create({
        data: {
          licencePlate: faker.string.alphanumeric(7),
          accountCoding: faker.string.alphanumeric(24),
          name: faker.company.name(),
          description: faker.lorem.sentence(),
          status: 'ACTIVE',
          created: faker.date.past(),
          projectOwnerId: user.id,
          primaryTechnicalLeadId: user.id,
          secondaryTechnicalLeadId: user.id,
          ministry: faker.helpers.arrayElement(Object.values(Ministry)),
          provider: faker.helpers.arrayElement(Object.values(Provider)),
          budget: {
            dev: +faker.commerce.price(),
            test: +faker.commerce.price(),
            prod: +faker.commerce.price(),
            tools: +faker.commerce.price(),
          },
        },
      });
    }

    // Create fake projects for the user
    for (let j = 0; j < numOfProjectsPerUser; j++) {
      const comments = [];
      for (let x = 0; x < 2; x++) {
        comments.push({ text: faker.lorem.sentence(), userId: user.id });
      }
      await prisma.privateCloudProject.create({
        data: {
          licencePlate: faker.string.alphanumeric(7),
          name: faker.company.name(),
          description: faker.lorem.sentence(),
          status: 'ACTIVE',
          created: faker.date.past(),
          projectOwnerId: user.id,
          primaryTechnicalLeadId: user.id,
          secondaryTechnicalLeadId: user.id,
          ministry: faker.helpers.arrayElement(Object.values(Ministry)),
          cluster: faker.helpers.arrayElement(Object.values(Cluster)),
          comments: { create: comments },
          productionQuota: {
            cpu: faker.helpers.arrayElement(DefaultCpuOptionsSchema.options),
            memory: faker.helpers.arrayElement(DefaultMemoryOptionsSchema.options),
            storage: faker.helpers.arrayElement(DefaultStorageOptionsSchema.options),
          },
          testQuota: {
            cpu: faker.helpers.arrayElement(DefaultCpuOptionsSchema.options),
            memory: faker.helpers.arrayElement(DefaultMemoryOptionsSchema.options),
            storage: faker.helpers.arrayElement(DefaultStorageOptionsSchema.options),
          },
          developmentQuota: {
            cpu: faker.helpers.arrayElement(DefaultCpuOptionsSchema.options),
            memory: faker.helpers.arrayElement(DefaultMemoryOptionsSchema.options),
            storage: faker.helpers.arrayElement(DefaultStorageOptionsSchema.options),
          },
          toolsQuota: {
            cpu: faker.helpers.arrayElement(DefaultCpuOptionsSchema.options),
            memory: faker.helpers.arrayElement(DefaultMemoryOptionsSchema.options),
            storage: faker.helpers.arrayElement(DefaultStorageOptionsSchema.options),
          },
          commonComponents,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
