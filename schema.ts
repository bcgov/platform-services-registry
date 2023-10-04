import {
  DefaultCpuOptions,
  DefaultMemoryOptions,
  DefaultStorageOptions,
  Cluster,
  Ministry,
  CommonComponentsOptions,
  Provider,
} from "@prisma/client";
import { string, number, z } from "zod";

export const CommonComponentsOptionsSchema = z.optional(
  z.nativeEnum(CommonComponentsOptions)
);

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
    other: z.optional(z.string()),
    noServices: z.boolean(),
  })
  .refine(
    (data) => {
      // Use Array.some() to check if at least one field has a value
      const checkBoxIsChecked = Object.values(data).some(
        (value) => value === "PLANNING_TO_USE" || value === "IMPLEMENTED"
      );
      const otherFieldHasValue = data.other !== undefined && data.other !== "";
      const noServicesIsChecked = data.noServices === true;

      return checkBoxIsChecked || otherFieldHasValue || noServicesIsChecked;
    },
    {
      message: "At least one common component option must be selected.",
    }
  );

export const UserInputSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  ministry: z.nativeEnum(Ministry),
});

export const BudgetInputSchema = z.object({
  dev: z.number(),
  test: z.number(),
  prod: z.number(),
  tools: z.number(),
});

export const CreateRequestPrivateBodySchema = z.object({
  name: z.string().nonempty({ message: "Name is required." }),
  description: z.string().nonempty({ message: "Description is required." }),
  cluster: z.nativeEnum(Cluster),
  ministry: z.nativeEnum(Ministry),
  projectOwner: UserInputSchema,
  primaryTechnicalLead: UserInputSchema,
  secondaryTechnicalLead: UserInputSchema.optional(),
  commonComponents: CommonComponentsInputSchema,
});

export const QuotaInputSchema = z.object({
  cpu: z.nativeEnum(DefaultCpuOptions),
  memory: z.nativeEnum(DefaultMemoryOptions),
  storage: z.nativeEnum(DefaultStorageOptions),
});

export const EditRequestBodySchema = CreateRequestPrivateBodySchema.merge(
  z.object({
    productionQuota: QuotaInputSchema,
    testQuota: QuotaInputSchema,
    toolsQuota: QuotaInputSchema,
    developmentQuota: QuotaInputSchema,
  })
);

export const CreateRequestPublicBodySchema = z.object({
  name: z.string().nonempty({ message: "Name is required." }),
  description: z.string().nonempty({ message: "Description is required." }),
  provider: z.nativeEnum(Provider),
  budget: BudgetInputSchema,
  ministry: z.nativeEnum(Ministry),
  projectOwner: UserInputSchema,
  primaryTechnicalLead: UserInputSchema,
  secondaryTechnicalLead: UserInputSchema.optional(),
  commonComponents: CommonComponentsInputSchema,
});

export type CreateRequestPrivateBody = z.infer<typeof CreateRequestPrivateBodySchema>;
export type UserInput = z.infer<typeof UserInputSchema>;
export type CommonComponentsInput = z.infer<typeof CommonComponentsInputSchema>;
export type QuotaInput = z.infer<typeof QuotaInputSchema>;
export type EditRequestBody = z.infer<typeof EditRequestBodySchema>;
