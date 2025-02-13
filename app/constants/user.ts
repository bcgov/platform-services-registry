import { Prisma } from '@prisma/client';

export enum GlobalPermissions {
  CreatePrivateCloudProducts = 'createPrivateCloudProducts',
  ViewAllPrivateCloudProducts = 'viewAllPrivateCloudProducts',
  ViewAllPrivateCloudProductsHistory = 'viewAllPrivateCloudProductsHistory',
  EditAllPrivateCloudProducts = 'editAllPrivateCloudProducts',
  DeleteAllPrivateCloudProducts = 'deleteAllPrivateCloudProducts',
  ReviewAllPrivateCloudRequests = 'reviewAllPrivateCloudRequests',

  CreatePublicCloudProducts = 'createPublicCloudProducts',
  ViewAllPublicCloudProducts = 'viewAllPublicCloudProducts',
  ViewAllPublicCloudProductsHistory = 'viewAllPublicCloudProductsHistory',
  EditAllPublicCloudProducts = 'editAllPublicCloudProducts',
  DeleteAllPublicCloudProducts = 'deleteAllPublicCloudProducts',
  ReviewAllPublicCloudRequests = 'reviewAllPublicCloudRequests',

  CreatePrivateProductComments = 'createPrivateProductComments',
  ViewAllPrivateProductComments = 'viewAllPrivateProductComments',
  EditAllPrivateProductComments = 'editAllPrivateProductComments',
  DeleteAllPrivateProductComments = 'deleteAllPrivateProductComments',

  CreatePublicProductComments = 'createPublicProductComments',
  ViewAllPublicProductComments = 'viewAllPublicProductComments',
  EditAllPublicProductComments = 'editAllPublicProductComments',
  DeleteAllPublicProductComments = 'deleteAllPublicProductComments',

  ViewZapscanResults = 'viewZapscanResults',
  ViewSonarscanResults = 'viewSonarscanResults',
  ViewGeneralAnalytics = 'viewGeneralAnalytics',
  ViewPrivateAnalytics = 'viewPrivateAnalytics',
  ViewPublicAnalytics = 'viewPublicAnalytics',

  DownloadBillingMou = 'downloadBillingMou',

  ViewBilling = 'viewBilling',
  ViewEvents = 'viewEvents',
  ViewUsers = 'viewUsers',
  ViewTasks = 'viewTasks',
  SendTaskEmails = 'sendTaskEmails',
  EditUsers = 'editUsers',
}

export enum GlobalRole {
  ServiceAccount = 'service-account',
  User = 'user',
  Admin = 'admin',
  Editor = 'editor',
  Reader = 'reader',
  Analyzer = 'analyzer',
  PrivateAdmin = 'private-admin',
  PrivateAnalyzer = 'private-analyzer',
  PrivateEditor = 'private-editor',
  PrivateReader = 'private-reader',
  PrivateReviewer = 'private-reviewer',
  PublicAdmin = 'public-admin',
  PublicAnalyzer = 'public-analyzer',
  PublicEditor = 'public-editor',
  PublicReader = 'public-reader',
  PublicReviewer = 'public-reviewer',
  UserReader = 'user-reader',
  Approver = 'approver',
  BillingReviewer = 'billing-reviewer',
  Billingreader = 'billing-reader',
  EventReader = 'event-reader',
  TaskReader = 'task-reader',
}

export const RoleToSessionProp = {
  [GlobalRole.ServiceAccount]: 'isServiceAccount',
  [GlobalRole.User]: 'isUser',
  [GlobalRole.Admin]: 'isAdmin',
  [GlobalRole.Editor]: 'isEditor',
  [GlobalRole.Reader]: 'isReader',
  [GlobalRole.Analyzer]: 'isAnalyzer',
  [GlobalRole.PrivateAdmin]: 'isPrivateAdmin',
  [GlobalRole.PrivateAnalyzer]: 'isPrivateAnalyzer',
  [GlobalRole.PrivateEditor]: 'isPrivateEditor',
  [GlobalRole.PrivateReader]: 'isPrivateReader',
  [GlobalRole.PrivateReviewer]: 'isPrivateReviewer',
  [GlobalRole.PublicAdmin]: 'isPublicAdmin',
  [GlobalRole.PublicAnalyzer]: 'isPublicAnalyzer',
  [GlobalRole.PublicEditor]: 'isPublicEditor',
  [GlobalRole.PublicReader]: 'isPublicReader',
  [GlobalRole.PublicReviewer]: 'isPublicReviewer',
  [GlobalRole.UserReader]: 'isUserReader',
  [GlobalRole.EventReader]: 'isEventReader',
  [GlobalRole.TaskReader]: 'isTaskReader',
  [GlobalRole.Approver]: 'isApprover',
  [GlobalRole.BillingReviewer]: 'isBillingReviewer',
  [GlobalRole.Billingreader]: 'isBillingReader',
};

export const sessionRolePropKeys = Object.values(RoleToSessionProp);

export const userSorts = [
  {
    label: 'Last active date (new to old)',
    sortKey: 'lastSeen',
    sortOrder: Prisma.SortOrder.desc,
  },
  {
    label: 'Last active date (old to new)',
    sortKey: 'lastSeen',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'First Name (A-Z)',
    sortKey: 'firstName',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'First Name (Z-A)',
    sortKey: 'firstName',
    sortOrder: Prisma.SortOrder.desc,
  },
  {
    label: 'Last Name (A-Z)',
    sortKey: 'lastName',
    sortOrder: Prisma.SortOrder.asc,
  },
  {
    label: 'Last Name (Z-A)',
    sortKey: 'lastName',
    sortOrder: Prisma.SortOrder.desc,
  },
];

export const userAttributes = [
  {
    role: 'Project Owner (PO)',
    content:
      'This is the business owner of the application, and their contact information will be used for non-technical inquiries.',
    key: 'projectOwner',
    isOptional: false,
  },
  {
    role: 'Primary Technical Lead (TL)',
    content:
      'This is the DevOps specialist that handles technical queries and platform updates. A Primary Technical Lead is required.',
    key: 'primaryTechnicalLead',
    isOptional: false,
  },
  {
    role: 'Secondary Technical Lead (TL)',
    content:
      'This is typically the DevOps specialist. We use this information to contact them with technical questions or notify them about platform events. You require a Primary Technical Lead, a Secondary Technical Lead is optional.',
    key: 'secondaryTechnicalLead',
    isOptional: true,
  },
  {
    role: 'Expense Authority (EA)',
    content:
      'Grants individuals permission to incur organizational expenses within set limits and guidelines. Use only an IDIR-linked email address below.',
    key: 'expenseAuthority',
    isOptional: false,
  },
];
