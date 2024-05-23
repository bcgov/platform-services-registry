import { Cluster, Ministry, Provider, $Enums } from '@prisma/client';
import { string, z } from 'zod';
import { processBoolean } from './utils/zod';

export const DefaultCpuOptionsSchema = z.enum([
  'CPU_REQUEST_0_5_LIMIT_1_5',
  'CPU_REQUEST_1_LIMIT_2',
  'CPU_REQUEST_2_LIMIT_4',
  'CPU_REQUEST_4_LIMIT_8',
  'CPU_REQUEST_8_LIMIT_16',
  'CPU_REQUEST_16_LIMIT_32',
  'CPU_REQUEST_32_LIMIT_64',
  'CPU_REQUEST_64_LIMIT_128',
]);

export const DefaultMemoryOptionsSchema = z.enum([
  'MEMORY_REQUEST_2_LIMIT_4',
  'MEMORY_REQUEST_4_LIMIT_8',
  'MEMORY_REQUEST_8_LIMIT_16',
  'MEMORY_REQUEST_16_LIMIT_32',
  'MEMORY_REQUEST_32_LIMIT_64',
  'MEMORY_REQUEST_64_LIMIT_128',
  'MEMORY_REQUEST_128_LIMIT_256',
]);

export const DefaultStorageOptionsSchema = z.enum([
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
  cpu: z.union([DefaultCpuOptionsSchema, z.string().regex(/CPU_REQUEST_\d+(\.\d+)?_LIMIT_\d+(\.\d+)?/)]),
  memory: z.union([DefaultMemoryOptionsSchema, z.string().regex(/MEMORY_REQUEST_\d+_LIMIT_\d+/)]),
  storage: z.union([DefaultStorageOptionsSchema, z.string().regex(/STORAGE_\d+/)]),
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
export type DefaultCpuOptions = z.infer<typeof DefaultCpuOptionsSchema>;
export type DefaultMemoryOptions = z.infer<typeof DefaultMemoryOptionsSchema>;
