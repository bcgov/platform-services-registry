import { z } from 'zod';
import { phoneNumberRegex } from '@/constants';
import { validateDistinctPOandTl } from '@/helpers/user';
import {
  Cluster,
  DecisionStatus,
  Prisma,
  ProjectStatus,
  RequestType,
  PrivateCloudProductMemberRole,
} from '@/prisma/client';
import { processEnumString, processBoolean } from '@/utils/js';
import { RequestDecision } from './shared';
import { optionalCommentSchema } from './shared';

export const privateCloudBillingSearchBodySchema = z.object({
  yearMonth: z.string().length(8, 'Date must be in YYYY-MMM'),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export type PrivateCloudBillingSearchBody = z.infer<typeof privateCloudBillingSearchBodySchema>;

export const resourceRequestsSchema = z.object({
  cpu: z
    .number()
    .min(0)
    .max(64)
    .refine((val) => val % 0.5 === 0, {
      message: 'CPU must be a multiple of 0.5',
    }),
  memory: z
    .number()
    .min(0)
    .max(128)
    .refine((val) => val % 1 === 0, {
      message: 'Memory must be an integer',
    }),
  storage: z
    .number()
    .min(0)
    .max(512)
    .refine((val) => val % 1 === 0, {
      message: 'Memory must be an integer',
    }),
});

export const resourceRequestsEnvSchema = z.object({
  development: resourceRequestsSchema,
  test: resourceRequestsSchema,
  production: resourceRequestsSchema,
  tools: resourceRequestsSchema,
});

const privateCloudProductMembers = z
  .array(
    z.object({
      userId: z.string().length(24, { message: 'Please select a member' }),
      roles: z
        .array(z.enum(PrivateCloudProductMemberRole))
        .min(1, { message: 'Please assign at least one role to a member' }),
    }),
  )
  .max(10);

export const _privateCloudCreateRequestBodySchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  description: z.string().min(1, { message: 'Description is required.' }),
  cluster: z.enum(Cluster),
  organizationId: z.string().length(24),
  isAgMinistry: z.boolean().default(false),
  projectOwnerId: z.string({ message: 'Please select a project owner' }).length(24),
  primaryTechnicalLeadId: z.string({ message: 'Please select a primary technical lead' }).length(24),
  secondaryTechnicalLeadId: z.string().length(24).or(z.literal('')).nullable().optional(),
  golddrEnabled: z.preprocess(processBoolean, z.boolean()) as unknown as z.ZodBoolean,
  isTest: z.preprocess(processBoolean, z.boolean()) as unknown as z.ZodBoolean,
  resourceRequests: resourceRequestsEnvSchema,
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
  requestComment: optionalCommentSchema,
});

export const privateCloudProductWebhookBodySchema = z.object({
  url: z
    .string()
    .url()
    .refine((value) => value.startsWith('https://'), {
      message: 'The URL must start with https://',
    })
    .or(z.literal(''))
    .or(z.null())
    .optional(),
  secret: z.string().min(2).max(40).or(z.literal('')).or(z.null()).optional(),
  username: z.string().min(2).max(40).or(z.literal('')).or(z.null()).optional(),
  password: z.string().min(2).max(40).or(z.literal('')).or(z.null()).optional(),
});

export const privateCloudCreateRequestBodySchema = _privateCloudCreateRequestBodySchema
  .merge(
    z.object({
      isAgMinistryChecked: z.boolean().optional(),
    }),
  )
  .merge(privateCloudProductWebhookBodySchema)
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

const _privateCloudEditRequestBodySchema = _privateCloudCreateRequestBodySchema.merge(
  z.object({
    requestComment: optionalCommentSchema,
    members: privateCloudProductMembers,
  }),
);

export const privateCloudEditRequestBodySchema = _privateCloudEditRequestBodySchema
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

export const privateCloudRequestDecisionBodySchema = _privateCloudEditRequestBodySchema.merge(
  z.object({
    type: z.enum(RequestType),
    decision: z.enum(RequestDecision),
    decisionComment: optionalCommentSchema,
  }),
);

export const privateCloudProductSearchNoPaginationBodySchema = z.object({
  search: z.string().optional(),
  ministries: z.array(z.string()).optional(),
  clusters: z.array(z.enum(Cluster)).optional(),
  status: z.array(z.enum(ProjectStatus)).optional(),
  temporary: z.array(z.enum(['YES', 'NO'])).optional(),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.enum(Prisma.SortOrder).optional()),
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
  ministries: z.array(z.string()).optional(),
  clusters: z.array(z.enum(Cluster)).optional(),
  types: z.array(z.enum(RequestType)).optional(),
  status: z.array(z.enum(DecisionStatus)).optional(),
  temporary: z.array(z.enum(['YES', 'NO'])).optional(),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.enum(Prisma.SortOrder).optional()),
});

export const privateCloudAdminUpdateBodySchema = z.object({
  isTest: z.preprocess(processBoolean, z.boolean()),
});

const minCpu = 1;
const maxCpu = 100000;
const minStorage = 1;
const maxStorage = 100000;

export const privateCloudUnitPriceBodySchema = z.object({
  cpu: z
    .number()
    .min(minCpu, { message: `CPU per 1Core must be at least $${minCpu}` })
    .max(maxCpu, { message: `CPU per 1Core must be at most $${maxCpu.toLocaleString()}` }),

  storage: z
    .number()
    .min(minStorage, { message: `Storage per 1GiB must be at least $${minStorage}` })
    .max(maxStorage, { message: `Storage per 1GiB must be at most $${maxStorage.toLocaleString()}` }),
});

export type PrivateCloudCreateRequestBody = z.infer<typeof privateCloudCreateRequestBodySchema>;
export type PrivateCloudEditRequestBody = z.infer<typeof privateCloudEditRequestBodySchema>;
export type PrivateCloudRequestDecisionBody = z.infer<typeof privateCloudRequestDecisionBodySchema>;
export type PrivateCloudProductSearchNoPaginationBody = z.infer<typeof privateCloudProductSearchNoPaginationBodySchema>;
export type PrivateCloudProductSearchBody = z.infer<typeof privateCloudProductSearchBodySchema>;
export type PrivateCloudRequestSearchBody = z.infer<typeof privateCloudRequestSearchBodySchema>;
export type PrivateCloudAdminUpdateBody = z.infer<typeof privateCloudAdminUpdateBodySchema>;
export type PrivateCloudProductWebhookBody = z.infer<typeof privateCloudProductWebhookBodySchema>;
export type PrivateCloudUnitPriceBody = z.infer<typeof privateCloudUnitPriceBodySchema>;
