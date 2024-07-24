import { Cluster, Ministry, Provider, $Enums, Prisma } from '@prisma/client';
import _isString from 'lodash-es/isString';
import { string, z } from 'zod';
import { processEnumString, processUpperEnumString, processBoolean } from '@/utils/zod';

export const QuotaCpuEnum = z.enum([
  'CPU_REQUEST_0_5_LIMIT_1_5',
  'CPU_REQUEST_1_LIMIT_2',
  'CPU_REQUEST_2_LIMIT_4',
  'CPU_REQUEST_4_LIMIT_8',
  'CPU_REQUEST_8_LIMIT_16',
  'CPU_REQUEST_16_LIMIT_32',
  'CPU_REQUEST_32_LIMIT_64',
  'CPU_REQUEST_64_LIMIT_128',
]);

export const QuotaMemoryEnum = z.enum([
  'MEMORY_REQUEST_2_LIMIT_4',
  'MEMORY_REQUEST_4_LIMIT_8',
  'MEMORY_REQUEST_8_LIMIT_16',
  'MEMORY_REQUEST_16_LIMIT_32',
  'MEMORY_REQUEST_32_LIMIT_64',
  'MEMORY_REQUEST_64_LIMIT_128',
  'MEMORY_REQUEST_128_LIMIT_256',
]);

export const QuotaStorageEnum = z.enum([
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

const phoneNumberRegex = /[2-9]\d{2}[2-9](?!11)\d{6}$/;

export const cpuOptions = Object.values(QuotaCpuEnum.enum);
export const memoryOptions = Object.values(QuotaMemoryEnum.enum);
export const storageOptions = Object.values(QuotaStorageEnum.enum);

const CommonComponentsOptionsSchema = z.object({
  planningToUse: z.boolean(),
  implemented: z.boolean(),
});

export const CommonComponentsInputSchema = z
  .object({
    addressAndGeolocation: CommonComponentsOptionsSchema,
    workflowManagement: CommonComponentsOptionsSchema,
    formDesignAndSubmission: CommonComponentsOptionsSchema,
    identityManagement: CommonComponentsOptionsSchema,
    paymentServices: CommonComponentsOptionsSchema,
    documentManagement: CommonComponentsOptionsSchema,
    endUserNotificationAndSubscription: CommonComponentsOptionsSchema,
    publishing: CommonComponentsOptionsSchema,
    businessIntelligence: CommonComponentsOptionsSchema,
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

export const QuotaInputSchema = z.object({
  cpu: z.union([QuotaCpuEnum, z.string().regex(/CPU_REQUEST_\d+(\.\d+)?_LIMIT_\d+(\.\d+)?/)]),
  memory: z.union([QuotaMemoryEnum, z.string().regex(/MEMORY_REQUEST_\d+_LIMIT_\d+/)]),
  storage: z.union([QuotaStorageEnum, z.string().regex(/STORAGE_\d+/)]),
});

export const DecisionOptionsSchema = z.enum(['APPROVED', 'REJECTED']);

export const BudgetInputSchema = z.object({
  dev: z.number().min(50.0, 'Value should be no less than USD 50').default(50.0),
  test: z.number().min(50.0, 'Value should be no less than USD 50').default(50.0),
  prod: z.number().min(50.0, 'Value should be no less than USD 50').default(50.0),
  tools: z.number().min(50.0, 'Value should be no less than USD 50').default(50.0),
});

export const UserInputSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().toLowerCase(),
  ministry: z.string(),
  idir: z.string().optional().nullable(),
  upn: z.string(),
  // ministry: z.nativeEnum(Ministry), // Not using ministry enum as a new ministry may not be in our system yet
});

export const PrivateCloudCreateRequestBodySchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  description: z.string().min(1, { message: 'Description is required.' }),
  cluster: z.nativeEnum(Cluster),
  ministry: z.nativeEnum(Ministry),
  projectOwner: UserInputSchema,
  primaryTechnicalLead: UserInputSchema,
  secondaryTechnicalLead: UserInputSchema.optional().nullable(),
  commonComponents: CommonComponentsInputSchema,
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
});

export const PublicCloudCreateRequestBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .refine((value) => !/[^A-Za-z0-9///.:+=@_ ]/g.test(value), 'Only /. : + = @ _ special symbols are allowed'),
  accountCoding: z
    .string()
    .refine((value) => /^[0-9A-Z\s]+$/.test(value), 'Account Coding should contain only uppercase characters, digits')
    .transform((value) => value.replace(/\s+/g, '').toLocaleUpperCase())
    .refine((value) => value.length === 24, 'Account Coding should contain 24 characters'),
  description: z.string().min(1, { message: 'Description is required.' }),
  provider: z.nativeEnum(Provider),
  budget: BudgetInputSchema,
  ministry: z.nativeEnum(Ministry),
  projectOwner: UserInputSchema,
  primaryTechnicalLead: UserInputSchema,
  secondaryTechnicalLead: UserInputSchema.optional().nullable(),
  expenseAuthority: UserInputSchema,
  requestComment: string().optional(),
  environmentsEnabled: z
    .object({
      development: z.boolean(),
      test: z.boolean(),
      production: z.boolean(),
      tools: z.boolean(),
    })
    .refine(
      (obj) => {
        return obj.development || obj.test || obj.production || obj.tools;
      },
      {
        message: 'At least one environment must be selected.',
      },
    ),
});

export const PrivateCloudEditRequestBodySchema = PrivateCloudCreateRequestBodySchema.merge(
  z.object({
    productionQuota: QuotaInputSchema,
    testQuota: QuotaInputSchema,
    toolsQuota: QuotaInputSchema,
    developmentQuota: QuotaInputSchema,
    requestComment: string().optional(),
  }),
);

export const PublicCloudEditRequestBodySchema = PublicCloudCreateRequestBodySchema.omit({});

export const PrivateCloudDecisionRequestBodySchema = PrivateCloudEditRequestBodySchema.merge(
  z.object({
    decision: DecisionOptionsSchema,
    decisionComment: string().optional(),
  }),
);

export const PublicCloudRequestDecisionBodySchema = PublicCloudEditRequestBodySchema.merge(
  z.object({
    decision: DecisionOptionsSchema,
    decisionComment: string().optional(),
  }),
);

export const SecurityConfigRequestBodySchema = z.object({
  licencePlate: z.string(),
  repositories: z
    .array(
      z.object({
        url: z
          .string()
          .url()
          .refine(
            (value) => /^https:\/\/github\.com\/bcgov\/[a-zA-Z0-9_-]+$/.test(value),
            "Please enter GitHub 'bcgov' organization's repository URL. (https://github.com/bcgov/<repo>)",
          ),
      }),
    )
    .max(10),
  context: z.union([z.literal($Enums.ProjectContext.PRIVATE), z.literal($Enums.ProjectContext.PUBLIC)]),
  clusterOrProvider: z.string().optional(),
});

export type PrivateCloudCreateRequestBody = z.infer<typeof PrivateCloudCreateRequestBodySchema>;
export type PublicCloudCreateRequestBody = z.infer<typeof PublicCloudCreateRequestBodySchema>;
export type UserInput = z.infer<typeof UserInputSchema>;
export type CommonComponentsInput = z.infer<typeof CommonComponentsInputSchema>;
export type QuotaInput = z.infer<typeof QuotaInputSchema>;
export type PrivateCloudEditRequestBody = z.infer<typeof PrivateCloudEditRequestBodySchema>;
export type PublicCloudEditRequestBody = z.infer<typeof PublicCloudEditRequestBodySchema>;
export type PublicCloudRequestDecisionBody = z.infer<typeof PublicCloudRequestDecisionBodySchema>;
export type DecisionOptions = z.infer<typeof DecisionOptionsSchema>;
export type DefaultCpuOptions = z.infer<typeof QuotaCpuEnum>;
export type DefaultMemoryOptions = z.infer<typeof QuotaMemoryEnum>;

export const privateCloudProductSearchNoPaginationBodySchema = z.object({
  search: z.string().optional(),
  ministry: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Ministry).optional()),
  cluster: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Cluster).optional()),
  includeInactive: z.boolean().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
  showTest: z.boolean().default(false),
});

export type PrivateCloudProductSearchNoPaginationBody = z.infer<typeof privateCloudProductSearchNoPaginationBodySchema>;

export const privateCloudProductSearchBodySchema = privateCloudProductSearchNoPaginationBodySchema.merge(
  z.object({
    page: z.number().optional(),
    pageSize: z.number().optional(),
  }),
);

export type PrivateCloudProductSearchBody = z.infer<typeof privateCloudProductSearchBodySchema>;

export const privateCloudRequestSearchBodySchema = z.object({
  licencePlate: z.string().optional(),
  search: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  ministry: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Ministry).optional()),
  cluster: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Cluster).optional()),
  includeInactive: z.boolean().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
  showTest: z.boolean().default(false),
});

export type PrivateCloudRequestSearchBody = z.infer<typeof privateCloudRequestSearchBodySchema>;

export const publicCloudProductSearchNoPaginationBodySchema = z.object({
  search: z.string().optional(),
  ministry: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Ministry).optional()),
  provider: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Provider).optional()),
  includeInactive: z.boolean().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
});

export type PublicCloudProductSearchNoPaginationBody = z.infer<typeof publicCloudProductSearchNoPaginationBodySchema>;

export const publicCloudProductSearchBodySchema = publicCloudProductSearchNoPaginationBodySchema.merge(
  z.object({
    page: z.number().optional(),
    pageSize: z.number().optional(),
  }),
);

export type PublicCloudProductSearchBody = z.infer<typeof publicCloudProductSearchBodySchema>;

export const publicCloudRequestSearchBodySchema = z.object({
  licencePlate: z.string().optional(),
  search: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  ministry: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Ministry).optional()),
  provider: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Provider).optional()),
  includeInactive: z.boolean().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
});

export type PublicCloudRequestSearchBody = z.infer<typeof publicCloudRequestSearchBodySchema>;

export const teamApiAccountSchema = z.object({
  roles: z.array(z.string()),
  users: z.array(
    z.object({
      email: z.string().email().min(5),
    }),
  ),
});

export type TeamApiAccountSchemaData = z.infer<typeof teamApiAccountSchema>;

export const privateCloudAdminUpdateBodySchema = z.object({
  isTest: z.preprocess(processBoolean, z.boolean()),
});

export type PrivateCloudAdminUpdateBody = z.infer<typeof privateCloudAdminUpdateBodySchema>;
