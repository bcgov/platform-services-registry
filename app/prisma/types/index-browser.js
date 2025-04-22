
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  providerUserId: 'providerUserId',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  upn: 'upn',
  idir: 'idir',
  idirGuid: 'idirGuid',
  officeLocation: 'officeLocation',
  jobTitle: 'jobTitle',
  image: 'image',
  ministry: 'ministry',
  archived: 'archived',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastSeen: 'lastSeen',
  onboardingDate: 'onboardingDate'
};

exports.Prisma.UserSessionScalarFieldEnum = {
  id: 'id',
  email: 'email',
  nextTokenRefreshTime: 'nextTokenRefreshTime',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  idToken: 'idToken',
  sub: 'sub',
  roles: 'roles'
};

exports.Prisma.PrivateCloudRequestScalarFieldEnum = {
  id: 'id',
  licencePlate: 'licencePlate',
  createdByEmail: 'createdByEmail',
  decisionMakerEmail: 'decisionMakerEmail',
  quotaContactName: 'quotaContactName',
  quotaContactEmail: 'quotaContactEmail',
  quotaJustification: 'quotaJustification',
  type: 'type',
  decisionStatus: 'decisionStatus',
  isQuotaChanged: 'isQuotaChanged',
  requestComment: 'requestComment',
  decisionComment: 'decisionComment',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  cancelledAt: 'cancelledAt',
  cancelledById: 'cancelledById',
  decisionDate: 'decisionDate',
  provisionedDate: 'provisionedDate',
  projectId: 'projectId',
  decisionDataId: 'decisionDataId',
  requestDataId: 'requestDataId',
  originalDataId: 'originalDataId'
};

exports.Prisma.PrivateCloudProductScalarFieldEnum = {
  id: 'id',
  licencePlate: 'licencePlate',
  name: 'name',
  description: 'description',
  status: 'status',
  isTest: 'isTest',
  temporaryProductNotificationDate: 'temporaryProductNotificationDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  projectOwnerId: 'projectOwnerId',
  primaryTechnicalLeadId: 'primaryTechnicalLeadId',
  secondaryTechnicalLeadId: 'secondaryTechnicalLeadId',
  ministry: 'ministry',
  cluster: 'cluster',
  golddrEnabled: 'golddrEnabled',
  supportPhoneNumber: 'supportPhoneNumber'
};

exports.Prisma.PrivateCloudRequestDataScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  status: 'status',
  licencePlate: 'licencePlate',
  isTest: 'isTest',
  createdAt: 'createdAt',
  projectOwnerId: 'projectOwnerId',
  primaryTechnicalLeadId: 'primaryTechnicalLeadId',
  secondaryTechnicalLeadId: 'secondaryTechnicalLeadId',
  ministry: 'ministry',
  cluster: 'cluster',
  golddrEnabled: 'golddrEnabled',
  supportPhoneNumber: 'supportPhoneNumber'
};

exports.Prisma.PrivateCloudProductWebhookScalarFieldEnum = {
  id: 'id',
  licencePlate: 'licencePlate',
  url: 'url',
  secret: 'secret',
  username: 'username',
  password: 'password'
};

exports.Prisma.PrivateCloudCommentScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  text: 'text',
  userId: 'userId',
  projectId: 'projectId',
  requestId: 'requestId',
  parentId: 'parentId',
  pinned: 'pinned'
};

exports.Prisma.ReactionScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  emoji: 'emoji',
  userId: 'userId',
  commentId: 'commentId'
};

exports.Prisma.PrivateCloudUnitPriceScalarFieldEnum = {
  id: 'id',
  cpu: 'cpu',
  storage: 'storage',
  date: 'date',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PublicCloudRequestScalarFieldEnum = {
  id: 'id',
  licencePlate: 'licencePlate',
  createdByEmail: 'createdByEmail',
  decisionMakerEmail: 'decisionMakerEmail',
  type: 'type',
  decisionStatus: 'decisionStatus',
  requestComment: 'requestComment',
  decisionComment: 'decisionComment',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  cancelledAt: 'cancelledAt',
  cancelledById: 'cancelledById',
  decisionDate: 'decisionDate',
  provisionedDate: 'provisionedDate',
  projectId: 'projectId',
  decisionDataId: 'decisionDataId',
  requestDataId: 'requestDataId',
  originalDataId: 'originalDataId'
};

exports.Prisma.PublicCloudBillingScalarFieldEnum = {
  id: 'id',
  licencePlate: 'licencePlate',
  expenseAuthorityId: 'expenseAuthorityId',
  signed: 'signed',
  signedAt: 'signedAt',
  signedById: 'signedById',
  approved: 'approved',
  approvedAt: 'approvedAt',
  approvedById: 'approvedById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PublicCloudProductScalarFieldEnum = {
  id: 'id',
  licencePlate: 'licencePlate',
  name: 'name',
  description: 'description',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  projectOwnerId: 'projectOwnerId',
  primaryTechnicalLeadId: 'primaryTechnicalLeadId',
  secondaryTechnicalLeadId: 'secondaryTechnicalLeadId',
  expenseAuthorityId: 'expenseAuthorityId',
  ministry: 'ministry',
  provider: 'provider',
  providerSelectionReasons: 'providerSelectionReasons',
  providerSelectionReasonsNote: 'providerSelectionReasonsNote'
};

exports.Prisma.PublicCloudRequestDataScalarFieldEnum = {
  id: 'id',
  licencePlate: 'licencePlate',
  name: 'name',
  description: 'description',
  status: 'status',
  createdAt: 'createdAt',
  projectOwnerId: 'projectOwnerId',
  primaryTechnicalLeadId: 'primaryTechnicalLeadId',
  secondaryTechnicalLeadId: 'secondaryTechnicalLeadId',
  expenseAuthorityId: 'expenseAuthorityId',
  ministry: 'ministry',
  provider: 'provider',
  providerSelectionReasons: 'providerSelectionReasons',
  providerSelectionReasonsNote: 'providerSelectionReasonsNote'
};

exports.Prisma.EventScalarFieldEnum = {
  id: 'id',
  type: 'type',
  userId: 'userId',
  createdAt: 'createdAt',
  data: 'data'
};

exports.Prisma.TaskScalarFieldEnum = {
  id: 'id',
  type: 'type',
  status: 'status',
  userIds: 'userIds',
  roles: 'roles',
  permissions: 'permissions',
  createdAt: 'createdAt',
  completedAt: 'completedAt',
  completedBy: 'completedBy',
  data: 'data',
  closedMetadata: 'closedMetadata'
};

exports.Prisma.PrivateCloudProductZapResultScalarFieldEnum = {
  id: 'id',
  licencePlate: 'licencePlate',
  cluster: 'cluster',
  host: 'host',
  html: 'html',
  available: 'available',
  scannedAt: 'scannedAt'
};

exports.Prisma.SecurityConfigScalarFieldEnum = {
  id: 'id',
  context: 'context',
  clusterOrProvider: 'clusterOrProvider',
  licencePlate: 'licencePlate'
};

exports.Prisma.SonarScanResultScalarFieldEnum = {
  id: 'id',
  context: 'context',
  clusterOrProvider: 'clusterOrProvider',
  licencePlate: 'licencePlate',
  url: 'url',
  sha: 'sha',
  source: 'source',
  scannedAt: 'scannedAt'
};

exports.Prisma.AcsResultScalarFieldEnum = {
  id: 'id',
  licencePlate: 'licencePlate',
  cluster: 'cluster',
  violationUrl: 'violationUrl',
  imageUrl: 'imageUrl',
  scannedAt: 'scannedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};
exports.RequestType = exports.$Enums.RequestType = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
  DELETE: 'DELETE'
};

exports.DecisionStatus = exports.$Enums.DecisionStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  AUTO_APPROVED: 'AUTO_APPROVED',
  REJECTED: 'REJECTED',
  PARTIALLY_PROVISIONED: 'PARTIALLY_PROVISIONED',
  PROVISIONED: 'PROVISIONED',
  CANCELLED: 'CANCELLED'
};

exports.ProjectStatus = exports.$Enums.ProjectStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

exports.Ministry = exports.$Enums.Ministry = {
  AEST: 'AEST',
  AG: 'AG',
  AGRI: 'AGRI',
  ALC: 'ALC',
  BCPC: 'BCPC',
  CITZ: 'CITZ',
  DBC: 'DBC',
  EAO: 'EAO',
  EDUC: 'EDUC',
  EMBC: 'EMBC',
  EMPR: 'EMPR',
  ENV: 'ENV',
  FIN: 'FIN',
  FLNR: 'FLNR',
  HLTH: 'HLTH',
  HOUS: 'HOUS',
  IRR: 'IRR',
  JEDC: 'JEDC',
  LBR: 'LBR',
  LDB: 'LDB',
  MAH: 'MAH',
  MCF: 'MCF',
  MMHA: 'MMHA',
  PSA: 'PSA',
  PSSG: 'PSSG',
  SDPR: 'SDPR',
  TCA: 'TCA',
  TRAN: 'TRAN',
  WLRS: 'WLRS'
};

exports.Cluster = exports.$Enums.Cluster = {
  CLAB: 'CLAB',
  KLAB: 'KLAB',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  GOLDDR: 'GOLDDR',
  KLAB2: 'KLAB2',
  EMERALD: 'EMERALD'
};

exports.PublicCloudRequestType = exports.$Enums.PublicCloudRequestType = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
  DELETE: 'DELETE'
};

exports.Provider = exports.$Enums.Provider = {
  AWS: 'AWS',
  AWS_LZA: 'AWS_LZA',
  AZURE: 'AZURE'
};

exports.EventType = exports.$Enums.EventType = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE_TEAM_API_TOKEN: 'CREATE_TEAM_API_TOKEN',
  UPDATE_TEAM_API_TOKEN: 'UPDATE_TEAM_API_TOKEN',
  DELETE_TEAM_API_TOKEN: 'DELETE_TEAM_API_TOKEN',
  CREATE_API_TOKEN: 'CREATE_API_TOKEN',
  DELETE_API_TOKEN: 'DELETE_API_TOKEN',
  CREATE_PRIVATE_CLOUD_PRODUCT: 'CREATE_PRIVATE_CLOUD_PRODUCT',
  UPDATE_PRIVATE_CLOUD_PRODUCT: 'UPDATE_PRIVATE_CLOUD_PRODUCT',
  DELETE_PRIVATE_CLOUD_PRODUCT: 'DELETE_PRIVATE_CLOUD_PRODUCT',
  EXPORT_PRIVATE_CLOUD_PRODUCT: 'EXPORT_PRIVATE_CLOUD_PRODUCT',
  REVIEW_PRIVATE_CLOUD_REQUEST: 'REVIEW_PRIVATE_CLOUD_REQUEST',
  RESEND_PRIVATE_CLOUD_REQUEST: 'RESEND_PRIVATE_CLOUD_REQUEST',
  CANCEL_PRIVATE_CLOUD_REQUEST: 'CANCEL_PRIVATE_CLOUD_REQUEST',
  REPROVISION_PRIVATE_CLOUD_PRODUCT: 'REPROVISION_PRIVATE_CLOUD_PRODUCT',
  CREATE_PUBLIC_CLOUD_PRODUCT: 'CREATE_PUBLIC_CLOUD_PRODUCT',
  UPDATE_PUBLIC_CLOUD_PRODUCT: 'UPDATE_PUBLIC_CLOUD_PRODUCT',
  DELETE_PUBLIC_CLOUD_PRODUCT: 'DELETE_PUBLIC_CLOUD_PRODUCT',
  EXPORT_PUBLIC_CLOUD_PRODUCT: 'EXPORT_PUBLIC_CLOUD_PRODUCT',
  REVIEW_PUBLIC_CLOUD_REQUEST: 'REVIEW_PUBLIC_CLOUD_REQUEST',
  RESEND_PUBLIC_CLOUD_REQUEST: 'RESEND_PUBLIC_CLOUD_REQUEST',
  CANCEL_PUBLIC_CLOUD_REQUEST: 'CANCEL_PUBLIC_CLOUD_REQUEST'
};

exports.TaskType = exports.$Enums.TaskType = {
  SIGN_PUBLIC_CLOUD_MOU: 'SIGN_PUBLIC_CLOUD_MOU',
  REVIEW_PUBLIC_CLOUD_MOU: 'REVIEW_PUBLIC_CLOUD_MOU',
  REVIEW_PRIVATE_CLOUD_REQUEST: 'REVIEW_PRIVATE_CLOUD_REQUEST',
  REVIEW_PUBLIC_CLOUD_REQUEST: 'REVIEW_PUBLIC_CLOUD_REQUEST'
};

exports.TaskStatus = exports.$Enums.TaskStatus = {
  ASSIGNED: 'ASSIGNED',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED'
};

exports.ProjectContext = exports.$Enums.ProjectContext = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC'
};

exports.Env = exports.$Enums.Env = {
  development: 'development',
  test: 'test',
  production: 'production',
  tools: 'tools'
};

exports.ResourceType = exports.$Enums.ResourceType = {
  cpu: 'cpu',
  memory: 'memory',
  storage: 'storage'
};

exports.PrivateCloudProductMemberRole = exports.$Enums.PrivateCloudProductMemberRole = {
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
  SUBSCRIBER: 'SUBSCRIBER'
};

exports.PublicCloudProductMemberRole = exports.$Enums.PublicCloudProductMemberRole = {
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
  SUBSCRIBER: 'SUBSCRIBER',
  BILLING_VIEWER: 'BILLING_VIEWER'
};

exports.Prisma.ModelName = {
  User: 'User',
  UserSession: 'UserSession',
  PrivateCloudRequest: 'PrivateCloudRequest',
  PrivateCloudProduct: 'PrivateCloudProduct',
  PrivateCloudRequestData: 'PrivateCloudRequestData',
  PrivateCloudProductWebhook: 'PrivateCloudProductWebhook',
  PrivateCloudComment: 'PrivateCloudComment',
  Reaction: 'Reaction',
  PrivateCloudUnitPrice: 'PrivateCloudUnitPrice',
  PublicCloudRequest: 'PublicCloudRequest',
  PublicCloudBilling: 'PublicCloudBilling',
  PublicCloudProduct: 'PublicCloudProduct',
  PublicCloudRequestData: 'PublicCloudRequestData',
  Event: 'Event',
  Task: 'Task',
  PrivateCloudProductZapResult: 'PrivateCloudProductZapResult',
  SecurityConfig: 'SecurityConfig',
  SonarScanResult: 'SonarScanResult',
  AcsResult: 'AcsResult'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
