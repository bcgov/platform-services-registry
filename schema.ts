import {
  DefaultCpuOptions,
  DefaultMemoryOptions,
  DefaultStorageOptions,
  Cluster,
  Ministry,
} from "@prisma/client";
import { string, number, z } from "zod";

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
            value
            // @ts-ignore
          ): value is { planningToUse?: boolean; implemented?: boolean } =>
            typeof value === "object" && value !== null
        ) // @ts-ignore
        .some((options) => options.planningToUse || options.implemented);

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
  email: z.string().email().toLowerCase(),
  ministry: z.nativeEnum(Ministry),
});

export const PrivateCloudCreateRequestBodySchema = z.object({
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

// // Since quota needs to support custom input, it is not an enum
// export const QuotaInputSchema = z.object({
//   cpu: z.string().nonempty("CPU cannot be empty"),
//   memory: z.string().nonempty("Memory cannot be empty"),
//   storage: z.string().nonempty("Storage cannot be empty"),
// });

export const PrivateCloudEditRequestBodySchema =
  PrivateCloudCreateRequestBodySchema.merge(
    z.object({
      productionQuota: QuotaInputSchema,
      testQuota: QuotaInputSchema,
      toolsQuota: QuotaInputSchema,
      developmentQuota: QuotaInputSchema,
    })
  );

export const DecisionOptionsSchema = z.enum(["APPROVED", "REJECTED"]);

export const PrivateCloudDecisionRequestBodySchema =
  PrivateCloudEditRequestBodySchema.merge(
    z.object({
      decision: DecisionOptionsSchema,
      humanComment: string().optional(),
    })
  );

export type PrivateCloudCreateRequestBody = z.infer<
  typeof PrivateCloudCreateRequestBodySchema
>;
export type UserInput = z.infer<typeof UserInputSchema>;
export type CommonComponentsInput = z.infer<typeof CommonComponentsInputSchema>;
export type QuotaInput = z.infer<typeof QuotaInputSchema>;
export type PrivateCloudEditRequestBody = z.infer<
  typeof PrivateCloudEditRequestBodySchema
>;
export type PrivateCloudDecisionRequestBody = z.infer<
  typeof PrivateCloudDecisionRequestBodySchema
>;
export type DecisionOptions = z.infer<typeof DecisionOptionsSchema>;
