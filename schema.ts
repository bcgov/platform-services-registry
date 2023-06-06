import { CommonComponentsOptions, Ministry } from "@prisma/client";
import { z } from "zod";

const CommonComponentsOptionsSchema = z.optional(
  z.nativeEnum(CommonComponentsOptions)
);

export const CommonComponentsSchema = z.object({
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
  noServices: z.boolean()
});

export const UserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  ministry: z.nativeEnum(Ministry)
});
