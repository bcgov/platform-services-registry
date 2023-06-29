import {
  PrismaClient,
  Ministry,
  Cluster,
  DefaultCpuOptions,
  DefaultMemoryOptions,
  DefaultStorageOptions,
  CommonComponentsOptions,
  Provider,
  ProjectStatus,
} from "@prisma/client";
const prisma = new PrismaClient();
import { faker } from "@faker-js/faker";

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
        name: fullName,
        email: faker.internet.email(),
        firstName: firstName,
        lastName: firstName,
        emailVerified: faker.date.past(),
        image: "avatar.png",
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
          name: faker.company.name(),
          description: faker.lorem.sentence(),
          status: "ACTIVE",
          created: faker.date.past(),
          projectOwnerId: user.id,
          primaryTechnicalLeadId: user.id,
          secondaryTechnicalLeadId: user.id,
          ministry: faker.helpers.arrayElement(Object.values(Ministry)),
          provider: faker.helpers.arrayElement(Object.values(Provider)),
          billingGroup: faker.lorem.word(),
          budget: {
            dev: +faker.commerce.price(),
            test: +faker.commerce.price(),
            prod: +faker.commerce.price(),
            tools: +faker.commerce.price(),
          },
          commonComponents: {
            addressAndGeolocation: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            workflowManagement: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            formDesignAndSubmission: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            identityManagement: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            paymentServices: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            documentManagement: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            endUserNotificationAndSubscription: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            publishing: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            businessIntelligence: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            other: faker.lorem.sentence(),
            noServices: false,
          },
        },
      });
    }

    // Create fake projects for the user
    for (let j = 0; j < numOfProjectsPerUser; j++) {
      await prisma.privateCloudProject.create({
        data: {
          licencePlate: faker.string.alphanumeric(7),
          name: faker.company.name(),
          description: faker.lorem.sentence(),
          status: "ACTIVE",
          created: faker.date.past(),
          projectOwnerId: user.id,
          primaryTechnicalLeadId: user.id,
          secondaryTechnicalLeadId: user.id,
          ministry: faker.helpers.arrayElement(Object.values(Ministry)),
          cluster: faker.helpers.arrayElement(Object.values(Cluster)),
          productionQuota: {
            cpu: faker.helpers.arrayElement(Object.values(DefaultCpuOptions)),
            memory: faker.helpers.arrayElement(
              Object.values(DefaultMemoryOptions)
            ),
            storage: faker.helpers.arrayElement(
              Object.values(DefaultStorageOptions)
            ),
          },
          testQuota: {
            cpu: faker.helpers.arrayElement(Object.values(DefaultCpuOptions)),
            memory: faker.helpers.arrayElement(
              Object.values(DefaultMemoryOptions)
            ),
            storage: faker.helpers.arrayElement(
              Object.values(DefaultStorageOptions)
            ),
          },
          developmentQuota: {
            cpu: faker.helpers.arrayElement(Object.values(DefaultCpuOptions)),
            memory: faker.helpers.arrayElement(
              Object.values(DefaultMemoryOptions)
            ),
            storage: faker.helpers.arrayElement(
              Object.values(DefaultStorageOptions)
            ),
          },
          toolsQuota: {
            cpu: faker.helpers.arrayElement(Object.values(DefaultCpuOptions)),
            memory: faker.helpers.arrayElement(
              Object.values(DefaultMemoryOptions)
            ),
            storage: faker.helpers.arrayElement(
              Object.values(DefaultStorageOptions)
            ),
          },
          commonComponents: {
            addressAndGeolocation: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            workflowManagement: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            formDesignAndSubmission: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            identityManagement: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            paymentServices: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            documentManagement: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            endUserNotificationAndSubscription: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            publishing: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            businessIntelligence: faker.helpers.arrayElement(
              Object.values(CommonComponentsOptions)
            ),
            other: faker.lorem.sentence(),
            noServices: false,
          },
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
