import {
  Ministry,
  Provider,
  Prisma,
  RequestType,
  ProjectStatus,
  DecisionStatus,
  PublicCloudProductMemberRole,
} from '@prisma/client';
import _isString from 'lodash-es/isString';
import { string, z } from 'zod';
import { AGMinistries } from '@/constants';
import { processEnumString } from '@/utils/js';
import { userSchema, RequestDecision } from './shared';

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
  dev: z.number().min(0).default(0),
  test: z.number().min(0).default(0),
  prod: z.number().min(0).default(0),
  tools: z.number().min(0).default(0),
});

const publicCloudProductMembers = z
  .array(
    z.object({
      userId: z.string().length(24, { message: 'Please select a member' }),
      roles: z.array(z.nativeEnum(PublicCloudProductMemberRole)),
    }),
  )
  .max(10);

const _publicCloudCreateRequestBodySchema = z.object({
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
  providerSelectionReasons: z.array(z.string()).min(1, { message: 'Reason for choosing provider is required' }),
  providerSelectionReasonsNote: z
    .string()
    .min(1, { message: 'An explanation of the reasons for choosing provider is required' })
    .max(1000, { message: 'Provider Selection not should contain a maximum of 1000 characters.' }),
  budget: budgetSchema,
  ministry: z.nativeEnum(Ministry),
  projectOwnerId: z.string().max(24),
  primaryTechnicalLeadId: z.string().max(24),
  secondaryTechnicalLeadId: z.string().max(24).optional().nullable(),
  expenseAuthorityId: z.string().max(24).optional(),
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

const isEmailUnique = (data: any) => {
  const { projectOwnerId, primaryTechnicalLeadId } = data;
  return projectOwnerId !== primaryTechnicalLeadId;
};

export const publicCloudCreateRequestBodySchema = _publicCloudCreateRequestBodySchema
  .merge(
    z.object({
      isAgMinistryChecked: z.boolean().optional(),
      isEaApproval: z.boolean().optional(),
    }),
  )
  .refine(
    (formData) => {
      return AGMinistries.includes(formData.ministry) ? formData.isAgMinistryChecked : true;
    },
    {
      message: 'AG Ministry Checkbox should be checked.',
      path: ['isAgMinistryChecked'],
    },
  )
  .refine(isEmailUnique, {
    message: 'The Project Owner and Primary Technical Lead must be different.',
    path: ['primaryTechnicalLead'],
  })
  .superRefine((data, ctx) => {
    console.log('data.budgetdata.budget', data.budget);
    const budgetSchema = getBudgetSchema(data.provider);
    const budgetParseResult = budgetSchema.safeParse(data.budget);

    if (!budgetParseResult.success) {
      budgetParseResult.error.errors.forEach((error) =>
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
      isEaApproval: z.boolean().optional(),
    }),
  )
  .refine(
    (formData) => {
      return AGMinistries.includes(formData.ministry) ? formData.isAgMinistryChecked : true;
    },
    {
      message: 'AG Ministry Checkbox should be checked.',
      path: ['isAgMinistryChecked'],
    },
  )
  .refine(isEmailUnique, {
    message: 'The Project Owner and Primary Technical Lead must be different.',
    path: ['primaryTechnicalLead'],
  });

export const publicCloudRequestDecisionBodySchema = _publicCloudEditRequestBodySchema.merge(
  z.object({
    type: z.nativeEnum(RequestType),
    decision: z.nativeEnum(RequestDecision),
    decisionComment: string().optional(),
  }),
);

export const publicCloudProductSearchNoPaginationBodySchema = z.object({
  search: z.string().optional(),
  ministries: z.array(z.nativeEnum(Ministry)).optional(),
  providers: z.array(z.nativeEnum(Provider)).optional(),
  status: z.array(z.nativeEnum(ProjectStatus)).optional(),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
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
  ministries: z.array(z.nativeEnum(Ministry)).optional(),
  providers: z.array(z.nativeEnum(Provider)).optional(),
  types: z.array(z.nativeEnum(RequestType)).optional(),
  status: z.array(z.nativeEnum(DecisionStatus)).optional(),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
});

export type PublicCloudCreateRequestBody = z.infer<typeof publicCloudCreateRequestBodySchema>;
export type PublicCloudEditRequestBody = z.infer<typeof publicCloudEditRequestBodySchema>;
export type PublicCloudRequestDecisionBody = z.infer<typeof publicCloudRequestDecisionBodySchema>;
export type PublicCloudProductSearchNoPaginationBody = z.infer<typeof publicCloudProductSearchNoPaginationBodySchema>;
export type PublicCloudProductSearchBody = z.infer<typeof publicCloudProductSearchBodySchema>;
export type PublicCloudRequestSearchBody = z.infer<typeof publicCloudRequestSearchBodySchema>;
