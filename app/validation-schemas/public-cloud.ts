import { z } from 'zod';
import {
  publicCloudNetworkingReasonMaxLength,
  publicCloudProviderSelectionReasonsNoteMaxLength,
} from '@/constants/public-cloud';
import { validateDistinctPOandTl } from '@/helpers/user';
import {
  Provider,
  Prisma,
  RequestType,
  ProjectStatus,
  DecisionStatus,
  PublicCloudProductMemberRole,
} from '@/prisma/client';
import { ProductBiliingStatus } from '@/types';
import { processEnumString } from '@/utils/js';
import { forecastMonthlyValueSchema } from './cloud-cost';
import { RequestDecision, optionalCommentSchema, repositoriesSchema } from './shared';

export const getBudgetSchema = (provider: Provider) => {
  if (provider === Provider.AZURE) {
    return z.object({
      dev: z.number().min(0).default(0),
      test: z.number().min(0).default(0),
      prod: z.number().min(0).default(0),
      tools: z.number().min(0).default(0),
    });
  }

  const minValue = 50;
  const message = 'Value should be no less than USD 100';

  return z.object({
    dev: z.number().min(minValue, message).default(minValue),
    test: z.number().min(minValue, message).default(minValue),
    prod: z.number().min(minValue, message).default(minValue),
    tools: z.number().min(minValue, message).default(minValue),
  });
};

const budgetSchema = z.object({
  dev: z.number().min(0),
  test: z.number().min(0),
  prod: z.number().min(0),
  tools: z.number().min(0),
});

const environmentsEnabledSchema = z.object({
  development: z.boolean(),
  developmentRequiresNetworking: z.boolean().default(false),
  test: z.boolean(),
  testRequiresNetworking: z.boolean().default(false),
  production: z.boolean(),
  productionRequiresNetworking: z.boolean().default(false),
  tools: z.boolean(),
  toolsRequiresNetworking: z.boolean().default(false),
});

function validateEnvironmentsEnabled(data: { environmentsEnabled: z.infer<typeof environmentsEnabledSchema> }) {
  const envs = data.environmentsEnabled;
  return envs.development || envs.test || envs.production || envs.tools;
}

const publicCloudProductMembers = z
  .array(
    z.object({
      userId: z.string().length(24, { message: 'Please select a member' }),
      roles: z
        .array(z.enum(PublicCloudProductMemberRole))
        .min(1, { message: 'Please assign at least one role to a member' }),
    }),
  )
  .max(10);

const publicCloudBaseRequestBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .refine((value) => !/[^A-Za-z0-9///.:+=@_ ]/g.test(value), 'Only /. : + = @ _ special symbols are allowed'),
  description: z.string().min(1, { message: 'Description is required.' }),
  repositories: repositoriesSchema,
  provider: z.enum(Provider),
  providerSelectionReasons: z.array(z.string()).min(1, { message: 'Reason for choosing provider is required' }),
  providerSelectionReasonsNote: z
    .string()
    .min(1, { message: 'An explanation of the reasons for choosing provider is required' })
    .max(publicCloudProviderSelectionReasonsNoteMaxLength, {
      message: `Provider selection note must be at most ${publicCloudProviderSelectionReasonsNoteMaxLength} characters.`,
    }),
  requiresNetworking: z.boolean().default(false),
  networkingReason: z
    .string()
    .max(publicCloudNetworkingReasonMaxLength, {
      message: `Networking reason must be at most ${publicCloudNetworkingReasonMaxLength} characters.`,
    })
    .default(''),
  budget: budgetSchema,
  organizationId: z.string().length(24),
  isAgMinistry: z.boolean(),
  projectOwnerId: z.string({ message: 'Please select a project owner' }).length(24),
  primaryTechnicalLeadId: z.string({ message: 'Please select a primary technical lead' }).length(24),
  secondaryTechnicalLeadId: z.string().length(24).or(z.literal('')).nullable().optional(),
  expenseAuthorityId: z.string({ message: 'Please select an expense authority' }).length(24),
  requestComment: optionalCommentSchema,
  environmentsEnabled: environmentsEnabledSchema,
});

type PublicCloudBaseRequestBody = z.infer<typeof publicCloudBaseRequestBodySchema>;

function validateNetworking(data: PublicCloudBaseRequestBody, ctx: z.RefinementCtx) {
  if (data.provider === Provider.AZURE && data.requiresNetworking && !data.networkingReason?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['networkingReason'],
      message: 'Networking reason is required.',
    });
  }

  if (data.provider !== Provider.AZURE && data.requiresNetworking) {
    ctx.addIssue({
      code: 'custom',
      path: ['requiresNetworking'],
      message: 'Networking is only supported for Azure.',
    });
  }

  (
    [
      ['development', 'developmentRequiresNetworking'],
      ['test', 'testRequiresNetworking'],
      ['production', 'productionRequiresNetworking'],
      ['tools', 'toolsRequiresNetworking'],
    ] as const
  ).forEach(([environmentKey, networkingKey]) => {
    const networkingEnabled = data.environmentsEnabled[networkingKey];

    if (networkingEnabled && !data.environmentsEnabled[environmentKey]) {
      ctx.addIssue({
        code: 'custom',
        path: ['environmentsEnabled', networkingKey],
        message: 'Environment networking can only be enabled when the environment is selected.',
      });
    } else if (networkingEnabled && !data.requiresNetworking) {
      ctx.addIssue({
        code: 'custom',
        path: ['environmentsEnabled', networkingKey],
        message: 'Environment networking can only be enabled when "Requires networking" is enabled.',
      });
    }
  });
}

function validateBudget(data: PublicCloudBaseRequestBody, ctx: z.RefinementCtx) {
  const schema = getBudgetSchema(data.provider);
  const result = schema.safeParse(data.budget);

  if (!result.success) {
    result.error.issues.forEach((error) => {
      ctx.addIssue({ ...error, path: ['budget', ...(error.path || [])] });
    });
  }
}

const validateAgMinistryChecked = (formData: PublicCloudBaseRequestBody & { isAgMinistryChecked?: boolean }) => {
  return formData.isAgMinistry ? formData.isAgMinistryChecked : true;
};

const applyCommonPublicCloudValidations = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .refine(
      (data) => validateEnvironmentsEnabled(data as { environmentsEnabled: z.infer<typeof environmentsEnabledSchema> }),
      {
        message: 'At least one environment must be selected.',
        path: ['environmentsEnabled'],
      },
    )
    .superRefine((data, ctx) => validateNetworking(data as PublicCloudBaseRequestBody, ctx));

const publicCloudEditBaseRequestBodySchema = publicCloudBaseRequestBodySchema.extend({
  members: publicCloudProductMembers,
});

export const publicCloudCreateRequestBodySchema = applyCommonPublicCloudValidations(
  publicCloudBaseRequestBodySchema.extend({
    isAgMinistryChecked: z.boolean().optional(),
    /** Optional spend forecast submitted with the create request; persisted after licence plate assignment. */
    forecastMonthlyValues: z.array(forecastMonthlyValueSchema).min(1).optional(),
  }),
)
  .refine(validateAgMinistryChecked, {
    message: 'AG Ministry Checkbox should be checked.',
    path: ['isAgMinistryChecked'],
  })
  .refine(validateDistinctPOandTl, {
    message: 'The Project Owner and Primary Technical Lead must be different.',
    path: ['primaryTechnicalLeadId'],
  })
  .superRefine(validateBudget);

export const publicCloudEditRequestBodySchema = applyCommonPublicCloudValidations(
  publicCloudEditBaseRequestBodySchema.extend({
    isAgMinistryChecked: z.boolean().optional(),
  }),
)
  .refine(validateAgMinistryChecked, {
    message: 'AG Ministry Checkbox should be checked.',
    path: ['isAgMinistryChecked'],
  })
  .refine(validateDistinctPOandTl, {
    message: 'The Project Owner and Primary Technical Lead must be different.',
    path: ['primaryTechnicalLeadId'],
  })
  .superRefine(validateBudget);

export const publicCloudRequestDecisionBodySchema = applyCommonPublicCloudValidations(
  publicCloudEditBaseRequestBodySchema.extend({
    type: z.enum(RequestType),
    decision: z.enum(RequestDecision),
    decisionComment: optionalCommentSchema,
  }),
).superRefine(validateBudget);

export const publicCloudProductSearchNoPaginationBodySchema = z.object({
  search: z.string().optional(),
  ministries: z.array(z.string()).optional(),
  providers: z.array(z.enum(Provider)).optional(),
  billingStatus: z.array(z.enum(ProductBiliingStatus)).optional(),
  status: z.array(z.enum(ProjectStatus)).optional(),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.enum(Prisma.SortOrder)).optional(),
});

export const publicCloudProductSearchBodySchema = publicCloudProductSearchNoPaginationBodySchema.extend({
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

export const publicCloudRequestSearchBodySchema = z.object({
  licencePlate: z.string().optional(),
  search: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  ministries: z.array(z.string()).optional(),
  providers: z.array(z.enum(Provider)).optional(),
  types: z.array(z.enum(RequestType)).optional(),
  status: z.array(z.enum(DecisionStatus)).optional(),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.enum(Prisma.SortOrder)).optional(),
});

export type PublicCloudCreateRequestBody = z.infer<typeof publicCloudCreateRequestBodySchema>;
export type PublicCloudEditRequestBody = z.infer<typeof publicCloudEditRequestBodySchema>;
export type PublicCloudRequestDecisionBody = z.infer<typeof publicCloudRequestDecisionBodySchema>;
export type PublicCloudProductSearchNoPaginationBody = z.infer<typeof publicCloudProductSearchNoPaginationBodySchema>;
export type PublicCloudProductSearchBody = z.infer<typeof publicCloudProductSearchBodySchema>;
export type PublicCloudRequestSearchBody = z.infer<typeof publicCloudRequestSearchBodySchema>;

export const publicCloudBillingSearchBodySchema = z.object({
  search: z.string().optional(),
  licencePlate: z.string().min(1).nullable().optional(),
  signed: z.boolean().optional(),
  approved: z.boolean().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.enum(Prisma.SortOrder)).optional(),
  includeMetadata: z.boolean().optional().default(false),
});

export type PublicCloudBillingSearchBody = z.infer<typeof publicCloudBillingSearchBodySchema>;

export const accountCodingSchema = z.object({
  cc: z
    .string()
    .length(3, 'Must be exactly 3 characters long')
    .regex(/^[A-Z0-9]+$/, 'Must contain only letters and numbers'),
  rc: z
    .string()
    .length(5, 'Must be exactly 5 characters long')
    .regex(/^[A-Z0-9]+$/, 'Must contain only letters and numbers'),
  sl: z
    .string()
    .length(5, 'Must be exactly 5 characters long')
    .regex(/^[A-Z0-9]+$/, 'Must contain only letters and numbers'),
  stob: z
    .string()
    .length(4, 'Must be exactly 4 characters long')
    .regex(/^[A-Z0-9]+$/, 'Must contain only letters and numbers')
    .nullable(),
  pc: z
    .string()
    .length(7, 'Must be exactly 7 characters long')
    .regex(/^[A-Z0-9]+$/, 'Must contain only letters and numbers'),
});

export const publicCloudBillingBodySchema = z.object({
  accountCoding: accountCodingSchema,
});

export type PublicCloudBillingBody = z.infer<typeof publicCloudBillingBodySchema>;
