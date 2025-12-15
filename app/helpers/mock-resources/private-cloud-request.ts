import { ProjectStatus, RequestType, DecisionStatus } from '@/prisma/client';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
import { generateShortId } from '@/utils/js';
import { getRandomCluster, getRandomUser, getRandomOrganization } from './core';
import { resourceRequests1, resourceRequests2 } from './private-cloud-product';
import { getFaker } from './safe-faker';

const faker = getFaker();

export function createSamplePrivateCloudRequest(args?: {
  data?: Partial<PrivateCloudRequestDetail>;
}): PrivateCloudRequestDetail {
  const { data } = args ?? {};

  const projectOwner = getRandomUser();
  const primaryTechnicalLead = getRandomUser();
  const secondaryTechnicalLead = getRandomUser();
  const organization = getRandomOrganization();

  const baseData = {
    licencePlate: faker ? faker.string.uuid().substring(0, 6) : 'abc123',
    name: faker ? faker.company.name() : 'Sample Private Cloud Project',
    description: faker ? faker.lorem.sentence() : 'Sample private cloud project description',
    status: ProjectStatus.ACTIVE,
    isTest: false,
    cluster: getRandomCluster(),
    projectOwnerId: projectOwner.id,
    projectOwner,
    primaryTechnicalLeadId: primaryTechnicalLead.id,
    primaryTechnicalLead,
    secondaryTechnicalLeadId: secondaryTechnicalLead.id,
    secondaryTechnicalLead,
    members: [],
    resourceRequests: resourceRequests1,
    golddrEnabled: false,
    supportPhoneNumber: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: new Date(),
    organizationId: organization.id,
    organization,
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
      name: faker ? faker.company.name() : 'Sample Private Cloud Project',
      description: faker ? faker.lorem.sentence() : 'Sample private cloud project description',
      projectOwnerId: po.id,
      projectOwner: po,
      primaryTechnicalLeadId: tl1.id,
      primaryTechnicalLead: tl1,
      secondaryTechnicalLeadId: tl2.id,
      secondaryTechnicalLead: tl2,
      resourceRequests: resourceRequests2,
    };
  };

  const decisionData = getDecisionData();

  const createdBy = getRandomUser();
  const decisionMaker = getRandomUser();
  const quotaContact = getRandomUser();

  const request: PrivateCloudRequestDetail = {
    id: generateShortId(),
    licencePlate: baseData.licencePlate,
    createdById: createdBy?.id,
    createdBy,
    decisionMakerId: decisionMaker?.id,
    decisionMaker,
    quotaContactName: quotaContact?.displayName,
    quotaContactEmail: quotaContact?.email,
    quotaJustification: faker ? faker.lorem.sentence() : 'Sample quota justification',
    type: RequestType.CREATE,
    decisionStatus: DecisionStatus.PENDING,
    isQuotaChanged: false,
    requestComment: faker ? faker.lorem.sentence() : 'Sample request comment',
    decisionComment: faker ? faker.lorem.sentence() : 'Sample decision comment',
    quotaUpgradeResourceDetailList: [],
    active: true,
    actioned: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    cancelledAt: null,
    cancelledById: null,
    cancelledBy: null,
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
