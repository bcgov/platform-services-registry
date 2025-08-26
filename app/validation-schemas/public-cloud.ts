import { z } from 'zod';
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
import { RequestDecision, optionalCommentSchema } from './shared';

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

const _publicCloudCreateRequestBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .refine((value) => !/[^A-Za-z0-9///.:+=@_ ]/g.test(value), 'Only /. : + = @ _ special symbols are allowed'),
  description: z.string().min(1, { message: 'Description is required.' }),
  provider: z.enum(Provider),
  providerSelectionReasons: z.array(z.string()).min(1, { message: 'Reason for choosing provider is required' }),
  providerSelectionReasonsNote: z
    .string()
    .min(1, { message: 'An explanation of the reasons for choosing provider is required' })
    .max(1000, { message: 'Provider Selection not should contain a maximum of 1000 characters.' }),
  budget: budgetSchema,
  organizationId: z.string().length(24),
  isAgMinistry: z.boolean().default(false),
  projectOwnerId: z.string({ message: 'Please select a project owner' }).length(24),
  primaryTechnicalLeadId: z.string({ message: 'Please select a primary technical lead' }).length(24),
  secondaryTechnicalLeadId: z.string().length(24).or(z.literal('')).nullable().optional(),
  expenseAuthorityId: z.string().length(24),
  requestComment: optionalCommentSchema,
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

export const publicCloudCreateRequestBodySchema = _publicCloudCreateRequestBodySchema
  .merge(
    z.object({
      isAgMinistryChecked: z.boolean().optional(),
    }),
  )
  .refine(
    (formData) => {
      return formData.isAgMinistry ? formData.isAgMinistryChecked : true;
    },
    {
      message: 'AG Ministry Checkbox should be checked.',
      path: ['isAgMinistryChecked'],
    },
  )
  .refine(validateDistinctPOandTl, {
    message: 'The Project Owner and Primary Technical Lead must be different.',
    path: ['primaryTechnicalLeadId'],
  })
  .superRefine((data, ctx) => {
    const budgetSchema = getBudgetSchema(data.provider);
    const budgetParseResult = budgetSchema.safeParse(data.budget);

    if (!budgetParseResult.success) {
      budgetParseResult.error.issues.forEach((error) =>
        ctx.addIssue({ ...error, path: ['budget', ...(error.path || [])] }),
      );
    }
  });

const _publicCloudEditRequestBodySchema = _publicCloudCreateRequestBodySchema.merge(
  z.object({
    members: publicCloudProductMembers,
  }),
);

export const publicCloudEditRequestBodySchema = _publicCloudEditRequestBodySchema
  .merge(
    z.object({
      isAgMinistryChecked: z.boolean().optional(),
    }),
  )
  .refine(
    (formData) => {
      return formData.isAgMinistry ? formData.isAgMinistryChecked : true;
    },
    {
      message: 'AG Ministry Checkbox should be checked.',
      path: ['isAgMinistryChecked'],
    },
  )
  .refine(validateDistinctPOandTl, {
    message: 'The Project Owner and Primary Technical Lead must be different.',
    path: ['primaryTechnicalLeadId'],
  });

export const publicCloudRequestDecisionBodySchema = _publicCloudEditRequestBodySchema.merge(
  z.object({
    type: z.enum(RequestType),
    decision: z.enum(RequestDecision),
    decisionComment: optionalCommentSchema,
  }),
);

export const publicCloudProductSearchNoPaginationBodySchema = z.object({
  search: z.string().optional(),
  ministries: z.array(z.string()).optional(),
  providers: z.array(z.enum(Provider)).optional(),
  billingStatus: z.array(z.enum(ProductBiliingStatus)).optional(),
  status: z.array(z.enum(ProjectStatus)).optional(),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.enum(Prisma.SortOrder).optional()),
});

export const publicCloudProductSearchBodySchema = publicCloudProductSearchNoPaginationBodySchema.merge(
  z.object({
    page: z.number().optional(),
    pageSize: z.number().optional(),
  }),
);

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
  sortOrder: z.preprocess(processEnumString, z.enum(Prisma.SortOrder).optional()),
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
  sortOrder: z.preprocess(processEnumString, z.enum(Prisma.SortOrder).optional()),
  includeMetadata: z.boolean().optional().default(false),
});

export type PublicCloudBillingSearchBody = z.infer<typeof publicCloudBillingSearchBodySchema>;

export const accountCodingSchema = z.object({
  cc: z
    .string()
    .length(3, 'Must be exactly 3 characters long')
    .regex(/^[0-9]+$/, 'Must contain only numbers'),
  rc: z
    .string()
    .length(5, 'Must be exactly 5 characters long')
    .regex(/^[A-Z0-9]+$/, 'Must contain only letters and numbers'),
  sl: z
    .string()
    .length(5, 'Must be exactly 5 characters long')
    .regex(/^[0-9]+$/, 'Must contain only numbers'),
  stob: z
    .string()
    .length(4, 'Must be exactly 4 characters long')
    .regex(/^[0-9]+$/, 'Must contain only numbers')
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
