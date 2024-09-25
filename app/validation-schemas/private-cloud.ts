import { Cluster, DecisionStatus, Ministry, Prisma, ProjectStatus, RequestType } from '@prisma/client';
import _isString from 'lodash-es/isString';
import { string, z } from 'zod';
import { phoneNumberRegex } from '@/constants/regex';
import { processEnumString, processUpperEnumString, processBoolean } from '@/utils/zod';
import { userSchema, requestDecisionEnum } from './shared';

export const CpuQuotaEnum = z.enum([
  'CPU_REQUEST_0_5_LIMIT_1_5',
  'CPU_REQUEST_1_LIMIT_2',
  'CPU_REQUEST_2_LIMIT_4',
  'CPU_REQUEST_4_LIMIT_8',
  'CPU_REQUEST_8_LIMIT_16',
  'CPU_REQUEST_16_LIMIT_32',
  'CPU_REQUEST_32_LIMIT_64',
  'CPU_REQUEST_64_LIMIT_128',
]);

export const MemoryQuotaEnum = z.enum([
  'MEMORY_REQUEST_2_LIMIT_4',
  'MEMORY_REQUEST_4_LIMIT_8',
  'MEMORY_REQUEST_8_LIMIT_16',
  'MEMORY_REQUEST_16_LIMIT_32',
  'MEMORY_REQUEST_32_LIMIT_64',
  'MEMORY_REQUEST_64_LIMIT_128',
  'MEMORY_REQUEST_128_LIMIT_256',
]);

export const StorageQuotaEnum = z.enum([
  'STORAGE_1',
  'STORAGE_2',
  'STORAGE_4',
  'STORAGE_16',
  'STORAGE_32',
  'STORAGE_64',
  'STORAGE_128',
  'STORAGE_256',
  'STORAGE_512',
]);

export const quotaSchema = z.object({
  cpu: z.union([CpuQuotaEnum, z.string().regex(/CPU_REQUEST_\d+(\.\d+)?_LIMIT_\d+(\.\d+)?/)]),
  memory: z.union([MemoryQuotaEnum, z.string().regex(/MEMORY_REQUEST_\d+_LIMIT_\d+/)]),
  storage: z.union([StorageQuotaEnum, z.string().regex(/STORAGE_\d+/)]),
});

const commonComponentItemSchema = z.object({
  planningToUse: z.boolean(),
  implemented: z.boolean(),
});

export const commonComponentsSchema = z
  .object({
    addressAndGeolocation: commonComponentItemSchema,
    workflowManagement: commonComponentItemSchema,
    formDesignAndSubmission: commonComponentItemSchema,
    identityManagement: commonComponentItemSchema,
    paymentServices: commonComponentItemSchema,
    documentManagement: commonComponentItemSchema,
    endUserNotificationAndSubscription: commonComponentItemSchema,
    publishing: commonComponentItemSchema,
    businessIntelligence: commonComponentItemSchema,
    other: z.string(),
    noServices: z.boolean(),
  })
  .refine(
    (data) => {
      const checkBoxIsChecked = Object.values(data)
        .filter(
          (
            value,
            // @ts-ignore
          ): value is { planningToUse?: boolean; implemented?: boolean } => typeof value === 'object' && value !== null,
        ) // @ts-ignore
        .some((options) => options.planningToUse || options.implemented);

      const otherFieldHasValue = data.other !== undefined && data.other !== '';
      const noServicesIsChecked = data.noServices === true;

      return checkBoxIsChecked || otherFieldHasValue || noServicesIsChecked;
    },
    {
      message: 'At least one common component option must be selected.',
    },
  );

export const privateCloudCreateRequestBodySchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  description: z.string().min(1, { message: 'Description is required.' }),
  cluster: z.nativeEnum(Cluster),
  ministry: z.nativeEnum(Ministry),
  projectOwner: userSchema,
  primaryTechnicalLead: userSchema,
  secondaryTechnicalLead: userSchema.optional().nullable(),
  commonComponents: commonComponentsSchema,
  golddrEnabled: z.preprocess(processBoolean, z.boolean()),
  isTest: z.preprocess(processBoolean, z.boolean()),
  quotaContactName: z.string().max(50).optional(),
  quotaContactEmail: z.union([z.undefined(), z.literal(''), z.string().email()]),
  quotaJustification: z.string().max(1000).optional(),
  supportPhoneNumber: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => {
        if (value === null || value === undefined) {
          return true;
        }
        return phoneNumberRegex.test(value);
      },
      {
        message: 'Invalid phone number format. Expected format: +1 (xxx) xxx-xxxx',
      },
    ),
  requestComment: string().optional(),
});

export const privateCloudEditRequestBodySchema = privateCloudCreateRequestBodySchema.merge(
  z.object({
    productionQuota: quotaSchema,
    testQuota: quotaSchema,
    toolsQuota: quotaSchema,
    developmentQuota: quotaSchema,
    requestComment: string().optional(),
  }),
);

export const privateCloudRequestDecisionBodySchema = privateCloudEditRequestBodySchema.merge(
  z.object({
    decision: requestDecisionEnum,
    decisionComment: string().optional(),
  }),
);

export const privateCloudProductSearchNoPaginationBodySchema = z.object({
  search: z.string().optional(),
  ministries: z.array(z.nativeEnum(Ministry)).optional(),
  clusters: z.array(z.nativeEnum(Cluster)).optional(),
  status: z.array(z.nativeEnum(ProjectStatus)).optional(),
  temporary: z.array(z.enum(['YES', 'NO'])).optional(),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
});

export const privateCloudProductSearchBodySchema = privateCloudProductSearchNoPaginationBodySchema.merge(
  z.object({
    page: z.number().optional(),
    pageSize: z.number().optional(),
  }),
);

export const privateCloudRequestSearchBodySchema = z.object({
  licencePlate: z.string().optional(),
  search: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  ministries: z.array(z.nativeEnum(Ministry)).optional(),
  clusters: z.array(z.nativeEnum(Cluster)).optional(),
  types: z.array(z.nativeEnum(RequestType)).optional(),
  status: z.array(z.nativeEnum(DecisionStatus)).optional(),
  temporary: z.array(z.enum(['YES', 'NO'])).optional(),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
});

export const privateCloudAdminUpdateBodySchema = z.object({
  isTest: z.preprocess(processBoolean, z.boolean()),
});

export type CpuQuota = z.infer<typeof CpuQuotaEnum>;
export type MemoryQuota = z.infer<typeof MemoryQuotaEnum>;
export type StorageQuota = z.infer<typeof StorageQuotaEnum>;
export type Quota = z.infer<typeof quotaSchema>;
export type CommonComponents = z.infer<typeof commonComponentsSchema>;
export type PrivateCloudCreateRequestBody = z.infer<typeof privateCloudCreateRequestBodySchema>;
export type PrivateCloudEditRequestBody = z.infer<typeof privateCloudEditRequestBodySchema>;
export type PrivateCloudRequestDecisionBody = z.infer<typeof privateCloudRequestDecisionBodySchema>;
export type PrivateCloudProductSearchNoPaginationBody = z.infer<typeof privateCloudProductSearchNoPaginationBodySchema>;
export type PrivateCloudProductSearchBody = z.infer<typeof privateCloudProductSearchBodySchema>;
export type PrivateCloudRequestSearchBody = z.infer<typeof privateCloudRequestSearchBodySchema>;
export type PrivateCloudAdminUpdateBody = z.infer<typeof privateCloudAdminUpdateBodySchema>;
