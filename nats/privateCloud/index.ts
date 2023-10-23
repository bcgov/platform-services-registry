import { RequestType, PrivateCloudRequest, PrivateCloudRequestedProject } from '@prisma/client';
import { Prisma } from '@prisma/client';

export type PrivateCloudRequestWithAdminRequestedProject = Prisma.PrivateCloudRequestedProjectGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
  };
}>;

export default async function sendPrivateCloudNatsMessage(
  requestId: PrivateCloudRequest['id'],
  requestType: RequestType,
  requestedProject: PrivateCloudRequestedProject,
  contactChanged: boolean,
) {
  return {};
}
