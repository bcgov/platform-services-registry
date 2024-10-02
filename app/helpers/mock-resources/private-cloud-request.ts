import { faker } from '@faker-js/faker';
import { ProjectStatus, RequestType, DecisionStatus } from '@prisma/client';
import { cpuOptions, memoryOptions, storageOptions } from '@/constants';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
import { generateShortId } from '@/utils/uuid';
import { getRandomMinistry, getRandomCluster, getRandomUser } from './core';

export function createSamplePrivateCloudRequest(args?: {
  data?: Partial<PrivateCloudRequestDetail>;
}): PrivateCloudRequestDetail {
  const { data } = args ?? {};

  const quota = {
    cpu: cpuOptions[0],
    memory: memoryOptions[0],
    storage: storageOptions[0],
  };

  const quota1 = {
    cpu: cpuOptions[1],
    memory: memoryOptions[1],
    storage: storageOptions[1],
  };

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
  };

  const projectOwner = getRandomUser();
  const primaryTechnicalLead = getRandomUser();
  const secondaryTechnicalLead = getRandomUser();

  const baseData = {
    licencePlate: faker.string.uuid().substring(0, 6),
    name: faker.company.name(),
    description: faker.lorem.sentence(),
    status: ProjectStatus.ACTIVE,
    isTest: false,
    cluster: getRandomCluster(),
    ministry: getRandomMinistry(),
    projectOwnerId: projectOwner.id,
    projectOwner,
    primaryTechnicalLeadId: primaryTechnicalLead.id,
    primaryTechnicalLead,
    secondaryTechnicalLeadId: secondaryTechnicalLead.id,
    secondaryTechnicalLead,
    developmentQuota: quota,
    testQuota: quota,
    productionQuota: quota,
    toolsQuota: quota,
    commonComponents: commonComponents,
    golddrEnabled: false,
    supportPhoneNumber: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const product = {
    ...baseData,
    id: generateShortId(),
    temporaryProductNotificationDate: new Date(),
  };

  const productData = {
    ...baseData,
    id: generateShortId(),
  };

  const getDecisionData = () => {
    const po = getRandomUser();
    const tl1 = getRandomUser();
    const tl2 = getRandomUser();

    return {
      ...productData,
      id: generateShortId(),
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      projectOwnerId: po.id,
      projectOwner: po,
      primaryTechnicalLeadId: tl1.id,
      primaryTechnicalLead: tl1,
      secondaryTechnicalLeadId: tl2.id,
      secondaryTechnicalLead: tl2,
      developmentQuota: quota1,
      testQuota: quota1,
      productionQuota: quota1,
      toolsQuota: quota1,
    };
  };

  const decisionData = getDecisionData();

  const createdBy = getRandomUser();
  const decisionMaker = getRandomUser();
  const quotaContact = getRandomUser();
  const request = {
    id: generateShortId(),
    licencePlate: baseData.licencePlate,
    createdByEmail: createdBy?.email,
    createdBy,
    decisionMakerEmail: decisionMaker?.email,
    quotaContactName: quotaContact?.displayName,
    quotaContactEmail: quotaContact?.email,
    quotaJustification: faker.lorem.sentence(),
    type: RequestType.CREATE,
    decisionStatus: DecisionStatus.PENDING,
    isQuotaChanged: false,
    requestComment: faker.lorem.sentence(),
    decisionComment: faker.lorem.sentence(),
    quotaUpgradeResourceDetailList: [],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    decisionDate: new Date(),
    provisionedDate: new Date(),
    projectId: product.id,
    project: product,
    decisionDataId: decisionData.id,
    decisionData,
    requestDataId: productData.id,
    requestData: productData,
    originalDataId: productData.id,
    originalData: productData,
    changes: null,
    ...data,
  };

  return request;
}
