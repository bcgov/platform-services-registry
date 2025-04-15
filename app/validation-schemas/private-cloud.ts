import {
  Cluster,
  DecisionStatus,
  Ministry,
  Prisma,
  ProjectStatus,
  RequestType,
  PrivateCloudProductMemberRole,
} from '@prisma/client';
import { string, z } from 'zod';
import { AGMinistries, phoneNumberRegex } from '@/constants';
import { validateDistinctPOandTl } from '@/helpers/user';
import { processEnumString, processBoolean } from '@/utils/js';
import { RequestDecision } from './shared';

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
      roles: z.array(z.nativeEnum(PrivateCloudProductMemberRole)),
    }),
  )
  .max(10);

export const _privateCloudCreateRequestBodySchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  description: z.string().min(1, { message: 'Description is required.' }),
  cluster: z.nativeEnum(Cluster),
  ministry: z.nativeEnum(Ministry),
  projectOwnerId: z.string().length(24),
  primaryTechnicalLeadId: z.string().length(24),
  secondaryTechnicalLeadId: z.string().length(24).or(z.literal('')).nullable().optional(),
  golddrEnabled: z.preprocess(processBoolean, z.boolean()),
  isTest: z.preprocess(processBoolean, z.boolean()),
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
  requestComment: string().optional(),
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
      return AGMinistries.includes(formData.ministry) ? formData.isAgMinistryChecked : true;
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
    requestComment: string().optional(),
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
      return AGMinistries.includes(formData.ministry) ? formData.isAgMinistryChecked : true;
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
    type: z.nativeEnum(RequestType),
    decision: z.nativeEnum(RequestDecision),
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

export type PrivateCloudCreateRequestBody = z.infer<typeof privateCloudCreateRequestBodySchema>;
export type PrivateCloudEditRequestBody = z.infer<typeof privateCloudEditRequestBodySchema>;
export type PrivateCloudRequestDecisionBody = z.infer<typeof privateCloudRequestDecisionBodySchema>;
export type PrivateCloudProductSearchNoPaginationBody = z.infer<typeof privateCloudProductSearchNoPaginationBodySchema>;
export type PrivateCloudProductSearchBody = z.infer<typeof privateCloudProductSearchBodySchema>;
export type PrivateCloudRequestSearchBody = z.infer<typeof privateCloudRequestSearchBodySchema>;
export type PrivateCloudAdminUpdateBody = z.infer<typeof privateCloudAdminUpdateBodySchema>;
export type PrivateCloudProductWebhookBody = z.infer<typeof privateCloudProductWebhookBodySchema>;
