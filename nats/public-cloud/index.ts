import {
  RequestType,
  PublicCloudRequest,
  PublicCloudRequestedProject
} from "@prisma/client";
import { Prisma } from "@prisma/client";

export type PrivateCloudRequestWithAdminRequestedProject =
  Prisma.PrivateCloudRequestedProjectGetPayload<{
    include: {
      projectOwner: true;
      primaryTechnicalLead: true;
      secondaryTechnicalLead: true;
    };
  }>;

export default async function sendPrivateCloudNatsMessage(
  requestId: PublicCloudRequest["id"],
  requestType: RequestType,
  requestedProject: PublicCloudRequestedProject
) {
  return {};
}
