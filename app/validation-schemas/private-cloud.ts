import {
  Cluster,
  DecisionStatus,
  Ministry,
  Prisma,
  ProjectStatus,
  RequestType,
  CPU,
  Memory,
  Storage,
  PrivateCloudProductMemberRole,
} from '@prisma/client';
import _isString from 'lodash-es/isString';
import { string, z } from 'zod';
import { AGMinistries, phoneNumberRegex } from '@/constants';
import { processEnumString, processUpperEnumString, processBoolean } from '@/utils/zod';
import { userSchema, RequestDecision } from './shared';

export const quotaSchema = z.object({
  cpu: z.nativeEnum(CPU),
  memory: z.nativeEnum(Memory),
  storage: z.nativeEnum(Storage),
});

export const quotasSchema = z.object({
  testQuota: quotaSchema,
  toolsQuota: quotaSchema,
  developmentQuota: quotaSchema,
  productionQuota: quotaSchema,
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

const isEmailUnique = (data: any) => {
  const { projectOwner, primaryTechnicalLead } = data;
  return projectOwner.email !== primaryTechnicalLead.email;
};

export const privateCloudCreateRequestBodySchema = _privateCloudCreateRequestBodySchema
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
  .refine(isEmailUnique, {
    message: 'Project Owner and Primary Technical Lead must not have the same email.',
    path: ['primaryTechnicalLead'],
  });

const _privateCloudEditRequestBodySchema = _privateCloudCreateRequestBodySchema.merge(
  z.object({
    productionQuota: quotaSchema,
    testQuota: quotaSchema,
    toolsQuota: quotaSchema,
    developmentQuota: quotaSchema,
    requestComment: string().optional(),
    members: privateCloudProductMembers,
  }),
);

export const privateCloudEditRequestBodySchema = _privateCloudEditRequestBodySchema.refine(isEmailUnique, {
  message: 'Project Owner and Primary Technical Lead must not have the same email.',
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

export type Quota = z.infer<typeof quotaSchema>;
export type Quotas = z.infer<typeof quotasSchema>;
export type CommonComponents = z.infer<typeof commonComponentsSchema>;
export type PrivateCloudCreateRequestBody = z.infer<typeof privateCloudCreateRequestBodySchema>;
export type PrivateCloudEditRequestBody = z.infer<typeof privateCloudEditRequestBodySchema>;
export type PrivateCloudRequestDecisionBody = z.infer<typeof privateCloudRequestDecisionBodySchema>;
export type PrivateCloudProductSearchNoPaginationBody = z.infer<typeof privateCloudProductSearchNoPaginationBodySchema>;
export type PrivateCloudProductSearchBody = z.infer<typeof privateCloudProductSearchBodySchema>;
export type PrivateCloudRequestSearchBody = z.infer<typeof privateCloudRequestSearchBodySchema>;
export type PrivateCloudAdminUpdateBody = z.infer<typeof privateCloudAdminUpdateBodySchema>;
