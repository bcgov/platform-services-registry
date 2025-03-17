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

  ViewPrivateWebhook = 'viewPrivateWebhook',
  EditPrivateWebhook = 'editPrivateWebhook',

  ViewZapscanResults = 'viewZapscanResults',
  ViewSonarscanResults = 'viewSonarscanResults',
  ViewGeneralAnalytics = 'viewGeneralAnalytics',
  ViewPrivateAnalytics = 'viewPrivateAnalytics',
  ViewPublicAnalytics = 'viewPublicAnalytics',

  ReviewPublicCloudBilling = 'reviewPublicCloudBilling',
  ViewPublicCloudBilling = 'viewPublicCloudBilling',
  DownloadPublicCloudBillingMou = 'downloadPublicCloudBillingMou',

  ViewEvents = 'viewEvents',
  ViewUsers = 'viewUsers',
  ViewTasks = 'viewTasks',
  SendTaskEmails = 'sendTaskEmails',
  EditUsers = 'editUsers',
  EditUserRoles = 'editUserRoles',
  EditUserOnboardingDate = 'editUserOnboardingDate',
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
  BillingManager = 'billing-manager',
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
  [GlobalRole.BillingManager]: 'isBillingManager',
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
