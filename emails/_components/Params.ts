import {
  PrivateCloudRequestWithProjectAndRequestedProject,
  PrivateCloudRequestWithRequestedProject,
} from '@/requestActions/private-cloud/decisionRequest';

import {
  PublicCloudRequestWithProjectAndRequestedProject,
  PublicCloudRequestWithRequestedProject,
} from '@/requestActions/public-cloud/decisionRequest';

import { PrivateCloudRequestedProjectWithContacts } from '@/nats/privateCloud';
import { PublicCloudRequestedProjectWithContacts } from '@/nats/publicCloud';

const sampleDate = new Date();

export const samplePublicRequest: PublicCloudRequestWithRequestedProject = {
  id: 'some-id',
  licencePlate: 'ABC123',
  createdByEmail: 'user@example.com',
  decisionMakerEmail: 'manager@example.com',
  type: 'CREATE', // or EDIT
  decisionStatus: 'PENDING', // or APPROVED, REJECTED, PROVISIONED
  requestComment: 'This is a sample request',
  decisionComment: 'This is a sample request',
  active: true,
  created: new Date('2023-11-30T00:00:00Z'),
  decisionDate: new Date('2023-12-01T00:00:00Z'),
  projectId: 'project-id',
  requestedProjectId: 'requested-project-id',
  userRequestedProjectId: 'user-requested-project-id',
  requestedProject: {
    id: 'requested-project-id',
    licencePlate: 'XYZ789',
    name: 'Sample Project',
    description: 'This is a sample project description',
    status: 'ACTIVE', // or INACTIVE
    created: new Date('2023-11-30T00:00:00Z'),
    accountCoding: '12345',
    budget: {
      dev: 1000.0,
      test: 2000.0,
      prod: 3000.0,
      tools: 500.0,
    },
    projectOwnerId: 'project-owner-id',
    primaryTechnicalLeadId: 'primary-lead-id',
    secondaryTechnicalLeadId: 'secondary-lead-id',
    expenseAuthorityId: 'expense-authority-id',
    ministry: 'EDUC', // or any other enum value from Ministry
    provider: 'AWS',
    projectOwner: {
      id: 'd',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'John.Doe@gov.bc.ca',
      idir: 'JDOE',
    },
    primaryTechnicalLead: {
      id: 'c',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'Sarah.Williams@gov.bc.ca',
      idir: 'SWILLIAMS',
    },
    expenseAuthority: {
      id: 'c',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'Sarah.Williams@gov.bc.ca',
      idir: 'SWILLIAMS',
    },
    secondaryTechnicalLead: null,
  },
};

export const samplePublicEditRequest: PublicCloudRequestWithProjectAndRequestedProject = {
  id: 'unique-id',
  licencePlate: 'LIC123',
  createdByEmail: 'creator@example.com',
  decisionMakerEmail: 'decider@example.com',
  type: 'CREATE', // or EDIT
  decisionStatus: 'PENDING', // or APPROVED, REJECTED, PROVISIONED
  requestComment: 'This is a sample request',
  decisionComment: 'This is a sample request',
  active: true,
  created: new Date('2023-11-30T00:00:00Z'),
  decisionDate: new Date('2023-12-01T00:00:00Z'),
  projectId: 'existing-project-id',
  requestedProjectId: 'new-project-id',
  userRequestedProjectId: 'user-request-project-id',
  project: {
    id: 'existing-project-id',
    licencePlate: 'LIC456',
    name: 'Existing Project',
    description: 'Description of the existing project',
    status: 'ACTIVE', // or INACTIVE
    created: new Date('2023-11-30T00:00:00Z'),
    accountCoding: 'AC12345',
    budget: {
      dev: 1500.0,
      test: 2500.0,
      prod: 3500.0,
      tools: 750.0,
    },
    projectOwnerId: 'owner-id',
    primaryTechnicalLeadId: 'primary-lead-id',
    secondaryTechnicalLeadId: 'secondary-lead-id',
    expenseAuthorityId: 'expense-authority-id',
    ministry: 'FIN', // or other Ministry enum value
    provider: 'AWS', // or GOOGLE
    projectOwner: {
      id: 'd',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'John.Doe@gov.bc.ca',
      idir: 'JDOE',
    },
    primaryTechnicalLead: {
      id: 'c',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'Sarah.Williams@gov.bc.ca',
      idir: 'SWILLIAMS',
    },
    expenseAuthority: {
      id: 'c',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'Sarah.Williams@gov.bc.ca',
      idir: 'SWILLIAMS',
    },
    secondaryTechnicalLead: null,
  },
  requestedProject: {
    id: 'new-project-id',
    licencePlate: 'LIC789',
    name: 'Requested Project',
    description: 'Description of the requested project',
    status: 'INACTIVE', // or ACTIVE
    created: new Date('2023-11-30T00:00:00Z'),
    accountCoding: 'BA98765',
    budget: {
      dev: 1501.0,
      test: 2501.0,
      prod: 3501.0,
      tools: 751.0,
    },
    projectOwnerId: 'new-owner-id',
    primaryTechnicalLeadId: 'new-primary-lead-id',
    secondaryTechnicalLeadId: 'new-secondary-lead-id',
    expenseAuthorityId: 'new-expense-authority-id',
    ministry: 'EDUC', // or other Ministry enum value
    provider: 'AWS', // or AWS
    projectOwner: {
      id: 'c',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'Sarah.Williams@gov.bc.ca',
      idir: 'SWILLIAMS',
    },
    primaryTechnicalLead: {
      id: 'd',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'John.Doe@gov.bc.ca',
      idir: 'JDOE',
    },
    secondaryTechnicalLead: {
      id: 'e',
      firstName: 'Jack',
      lastName: 'Black',
      email: 'jack.black@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'Jack.Black@gov.bc.ca',
      idir: 'JBLACK',
    },
    expenseAuthority: {
      id: 'c',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'Sarah.Williams@gov.bc.ca',
      idir: 'SWILLIAMS',
    },
  },
};

export const samplePublicProduct: PublicCloudRequestedProjectWithContacts = {
  id: 'requested-project-id',
  licencePlate: 'XYZ789',
  name: 'Sample Project',
  description: 'This is a sample project description',
  status: 'ACTIVE', // or INACTIVE
  created: new Date('2023-11-30T00:00:00Z'),
  accountCoding: '12345',
  budget: {
    dev: 1000.0,
    test: 2000.0,
    prod: 3000.0,
    tools: 500.0,
  },
  projectOwnerId: 'project-owner-id',
  primaryTechnicalLeadId: 'primary-lead-id',
  secondaryTechnicalLeadId: 'secondary-lead-id',
  expenseAuthorityId: 'expense-authority-id',
  ministry: 'EDUC', // or any other enum value from Ministry
  provider: 'AWS',
  projectOwner: {
    id: 'd',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gov.bc.ca',
    image: null,
    ministry: 'CITZ',
    archived: false,
    created: sampleDate,
    lastSeen: sampleDate,
    upn: 'John.Doe@gov.bc.ca',
    idir: 'JDOE',
  },
  primaryTechnicalLead: {
    id: 'c',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@gov.bc.ca',
    image: null,
    ministry: 'CITZ',
    archived: false,
    created: sampleDate,
    lastSeen: sampleDate,
    upn: 'Sarah.Williams@gov.bc.ca',
    idir: 'SWILLIAMS',
  },
  expenseAuthority: {
    id: 'c',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@gov.bc.ca',
    image: null,
    ministry: 'CITZ',
    archived: false,
    created: sampleDate,
    lastSeen: sampleDate,
    upn: 'Sarah.Williams@gov.bc.ca',
    idir: 'SWILLIAMS',
  },
  secondaryTechnicalLead: null,
};

export const samplePrivateRequest: PrivateCloudRequestWithRequestedProject = {
  id: 'a',
  licencePlate: 'be74f8',
  createdByEmail: 'john.doe@gov.bc.ca',
  decisionMakerEmail: 'junmin.ahn@gov.bc.ca',
  type: 'CREATE',
  decisionStatus: 'APPROVED',
  decisionComment: 'This is a comment',
  active: true,
  created: sampleDate,
  decisionDate: sampleDate,
  isQuotaChanged: false,
  projectId: null,
  requestComment: 'Some comment regarding a request by the user',
  requestedProjectId: 'f',
  userRequestedProjectId: 'e',
  requestedProject: {
    productionQuota: {
      cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
      memory: 'MEMORY_REQUEST_2_LIMIT_4',
      storage: 'STORAGE_1',
    },
    testQuota: {
      cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
      memory: 'MEMORY_REQUEST_2_LIMIT_4',
      storage: 'STORAGE_1',
    },
    developmentQuota: {
      cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
      memory: 'MEMORY_REQUEST_2_LIMIT_4',
      storage: 'STORAGE_1',
    },
    toolsQuota: {
      cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
      memory: 'MEMORY_REQUEST_2_LIMIT_4',
      storage: 'STORAGE_1',
    },
    commonComponents: {
      addressAndGeolocation: { planningToUse: true, implemented: false },
      workflowManagement: { planningToUse: false, implemented: false },
      formDesignAndSubmission: { planningToUse: false, implemented: false },
      identityManagement: { planningToUse: false, implemented: false },
      paymentServices: { planningToUse: false, implemented: false },
      documentManagement: { planningToUse: false, implemented: false },
      endUserNotificationAndSubscription: { planningToUse: false, implemented: false },
      publishing: { planningToUse: false, implemented: false },
      businessIntelligence: { planningToUse: false, implemented: false },
      other: '',
      noServices: false,
    },
    id: 'f',
    name: '31.1',
    description: '1',
    status: 'ACTIVE',
    licencePlate: 'be74f8',
    created: sampleDate,
    projectOwnerId: 'd',
    primaryTechnicalLeadId: 'c',
    secondaryTechnicalLeadId: null,
    ministry: 'CITZ',
    cluster: 'SILVER',
    projectOwner: {
      id: 'd',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'John.Doe@gov.bc.ca',
      idir: 'JDOE',
    },
    primaryTechnicalLead: {
      id: 'c',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'Sarah.Williams@gov.bc.ca',
      idir: 'SWILLIAMS',
    },
    secondaryTechnicalLead: null,
  },
};

export const samplePrivateEditRequest: PrivateCloudRequestWithProjectAndRequestedProject = {
  id: 'a',
  licencePlate: 'be74f8',
  createdByEmail: 'john.doe@gov.bc.ca',
  decisionMakerEmail: 'junmin.ahn@gov.bc.ca',
  type: 'CREATE',
  decisionStatus: 'APPROVED',
  decisionComment: 'This is a comment',
  active: true,
  created: sampleDate,
  isQuotaChanged: false,
  decisionDate: sampleDate,
  requestComment: 'Some comment made by the user',
  projectId: null,
  requestedProjectId: 'f',
  userRequestedProjectId: 'e',
  project: {
    productionQuota: {
      cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
      memory: 'MEMORY_REQUEST_2_LIMIT_4',
      storage: 'STORAGE_1',
    },
    testQuota: {
      cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
      memory: 'MEMORY_REQUEST_2_LIMIT_4',
      storage: 'STORAGE_1',
    },
    developmentQuota: {
      cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
      memory: 'MEMORY_REQUEST_2_LIMIT_4',
      storage: 'STORAGE_1',
    },
    toolsQuota: {
      cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
      memory: 'MEMORY_REQUEST_2_LIMIT_4',
      storage: 'STORAGE_1',
    },
    commonComponents: {
      addressAndGeolocation: { planningToUse: true, implemented: false },
      workflowManagement: { planningToUse: false, implemented: false },
      formDesignAndSubmission: { planningToUse: false, implemented: false },
      identityManagement: { planningToUse: false, implemented: false },
      paymentServices: { planningToUse: false, implemented: false },
      documentManagement: { planningToUse: false, implemented: false },
      endUserNotificationAndSubscription: { planningToUse: false, implemented: false },
      publishing: { planningToUse: false, implemented: false },
      businessIntelligence: { planningToUse: false, implemented: false },
      other: '',
      noServices: false,
    },
    id: 'f',
    name: '31.1',
    description: '1',
    status: 'ACTIVE',
    licencePlate: 'be74f8',
    created: sampleDate,
    projectOwnerId: 'd',
    primaryTechnicalLeadId: 'c',
    secondaryTechnicalLeadId: null,
    ministry: 'CITZ',
    cluster: 'SILVER',
    projectOwner: {
      id: 'd',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'John.Doe@gov.bc.ca',
      idir: 'JDOE',
    },
    primaryTechnicalLead: {
      id: 'c',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'Sarah.Williams@gov.bc.ca',
      idir: 'SWILLIAMS',
    },
    secondaryTechnicalLead: null,
  },
  requestedProject: {
    productionQuota: {
      cpu: 'CPU_REQUEST_1_LIMIT_2',
      memory: 'MEMORY_REQUEST_4_LIMIT_8',
      storage: 'STORAGE_4',
    },
    testQuota: {
      cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
      memory: 'MEMORY_REQUEST_2_LIMIT_4',
      storage: 'STORAGE_2',
    },
    developmentQuota: {
      cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
      memory: 'MEMORY_REQUEST_2_LIMIT_4',
      storage: 'STORAGE_3',
    },
    toolsQuota: {
      cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
      memory: 'MEMORY_REQUEST_2_LIMIT_4',
      storage: 'STORAGE_1',
    },
    commonComponents: {
      addressAndGeolocation: { planningToUse: true, implemented: false },
      workflowManagement: { planningToUse: false, implemented: false },
      formDesignAndSubmission: { planningToUse: false, implemented: false },
      identityManagement: { planningToUse: false, implemented: false },
      paymentServices: { planningToUse: false, implemented: false },
      documentManagement: { planningToUse: false, implemented: false },
      endUserNotificationAndSubscription: { planningToUse: false, implemented: false },
      publishing: { planningToUse: false, implemented: false },
      businessIntelligence: { planningToUse: false, implemented: false },
      other: '',
      noServices: false,
    },
    id: 'f',
    name: 'CHANGED NAME',
    description: 'CHANGED DESC',
    status: 'ACTIVE',
    licencePlate: 'be74f8',
    created: sampleDate,
    projectOwnerId: 'd',
    primaryTechnicalLeadId: 'd',
    secondaryTechnicalLeadId: null,
    ministry: 'AGRI',
    cluster: 'GOLD',
    projectOwner: {
      id: 'd',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'John.Doe@gov.bc.ca',
      idir: 'JDOE',
    },
    primaryTechnicalLead: {
      id: 'd',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'John.Doe@gov.bc.ca',
      idir: 'JDOE',
    },
    secondaryTechnicalLead: {
      id: 'd',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gov.bc.ca',
      image: null,
      ministry: 'CITZ',
      archived: false,
      created: sampleDate,
      lastSeen: sampleDate,
      upn: 'John.Doe@gov.bc.ca',
      idir: 'JDOE',
    },
  },
};

export const samplePrivateProduct: PrivateCloudRequestedProjectWithContacts = {
  id: 'a',
  licencePlate: 'be74f8',
  created: sampleDate,
  productionQuota: {
    cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
    memory: 'MEMORY_REQUEST_2_LIMIT_4',
    storage: 'STORAGE_1',
  },
  testQuota: {
    cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
    memory: 'MEMORY_REQUEST_2_LIMIT_4',
    storage: 'STORAGE_1',
  },
  developmentQuota: {
    cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
    memory: 'MEMORY_REQUEST_2_LIMIT_4',
    storage: 'STORAGE_1',
  },
  toolsQuota: {
    cpu: 'CPU_REQUEST_0_5_LIMIT_1_5',
    memory: 'MEMORY_REQUEST_2_LIMIT_4',
    storage: 'STORAGE_1',
  },
  commonComponents: {
    addressAndGeolocation: { planningToUse: true, implemented: false },
    workflowManagement: { planningToUse: false, implemented: false },
    formDesignAndSubmission: { planningToUse: false, implemented: false },
    identityManagement: { planningToUse: false, implemented: false },
    paymentServices: { planningToUse: false, implemented: false },
    documentManagement: { planningToUse: false, implemented: false },
    endUserNotificationAndSubscription: { planningToUse: false, implemented: false },
    publishing: { planningToUse: false, implemented: false },
    businessIntelligence: { planningToUse: false, implemented: false },
    other: '',
    noServices: false,
  },
  name: '31.1',
  description: '1',
  status: 'ACTIVE',
  projectOwnerId: 'd',
  primaryTechnicalLeadId: 'c',
  secondaryTechnicalLeadId: null,
  ministry: 'CITZ',
  cluster: 'SILVER',
  projectOwner: {
    id: 'd',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gov.bc.ca',
    image: null,
    ministry: 'CITZ',
    archived: false,
    created: sampleDate,
    lastSeen: sampleDate,
    upn: 'John.Doe@gov.bc.ca',
    idir: 'JDOE',
  },
  primaryTechnicalLead: {
    id: 'c',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@gov.bc.ca',
    image: null,
    ministry: 'CITZ',
    archived: false,
    created: sampleDate,
    lastSeen: sampleDate,
    upn: 'Sarah.Williams@gov.bc.ca',
    idir: 'SWILLIAMS',
  },
  secondaryTechnicalLead: {
    id: 'c',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@gov.bc.ca',
    image: null,
    ministry: 'CITZ',
    archived: false,
    created: sampleDate,
    lastSeen: sampleDate,
    upn: 'Sarah.Williams@gov.bc.ca',
    idir: 'SWILLIAMS',
  },
};
