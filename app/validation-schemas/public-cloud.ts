import { Cluster, Ministry, Provider, $Enums, Prisma, RequestType } from '@prisma/client';
import _isString from 'lodash-es/isString';
import { string, z } from 'zod';
import { processEnumString, processUpperEnumString, processBoolean } from '@/utils/zod';
import { userSchema, requestDecisionEnum } from './shared';

export const budgetSchema = z.object({
  dev: z.number().min(50.0, 'Value should be no less than USD 50').default(50.0),
  test: z.number().min(50.0, 'Value should be no less than USD 50').default(50.0),
  prod: z.number().min(50.0, 'Value should be no less than USD 50').default(50.0),
  tools: z.number().min(50.0, 'Value should be no less than USD 50').default(50.0),
});

export const publicCloudCreateRequestBodySchema = z.object({
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
  budget: budgetSchema,
  ministry: z.nativeEnum(Ministry),
  projectOwner: userSchema,
  primaryTechnicalLead: userSchema,
  secondaryTechnicalLead: userSchema.optional().nullable(),
  expenseAuthority: userSchema,
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

export const publicCloudEditRequestBodySchema = publicCloudCreateRequestBodySchema.omit({});

export const publicCloudRequestDecisionBodySchema = publicCloudEditRequestBodySchema.merge(
  z.object({
    type: z.nativeEnum(RequestType),
    decision: requestDecisionEnum,
    decisionComment: string().optional(),
  }),
);

export const publicCloudProductSearchNoPaginationBodySchema = z.object({
  search: z.string().optional(),
  ministry: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Ministry).optional()),
  provider: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Provider).optional()),
  includeInactive: z.boolean().optional(),
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
  ministry: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Ministry).optional()),
  provider: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Provider).optional()),
  includeInactive: z.boolean().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
});

export type Budget = z.infer<typeof budgetSchema>;
export type PublicCloudCreateRequestBody = z.infer<typeof publicCloudCreateRequestBodySchema>;
export type PublicCloudEditRequestBody = z.infer<typeof publicCloudEditRequestBodySchema>;
export type PublicCloudRequestDecisionBody = z.infer<typeof publicCloudRequestDecisionBodySchema>;
export type PublicCloudProductSearchNoPaginationBody = z.infer<typeof publicCloudProductSearchNoPaginationBodySchema>;
export type PublicCloudProductSearchBody = z.infer<typeof publicCloudProductSearchBodySchema>;
export type PublicCloudRequestSearchBody = z.infer<typeof publicCloudRequestSearchBodySchema>;
