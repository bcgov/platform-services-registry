import { Cluster, RequestType } from '@prisma/client';
import { sendPrivateCloudNatsMessage } from '@/services/nats';
import { PrivateCloudRequestDetail, PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';

interface User {
  email?: string;
}

// TODO: refactor here to just take request as it will have original data available.
export async function sendRequestNatsMessage(
  updatedRequest: PrivateCloudRequestDetailDecorated,
  updateData: {
    projectOwner: User;
    primaryTechnicalLead: User;
    secondaryTechnicalLead: User | null;
  },
) {
  const contactsChanged =
    updateData.projectOwner.email !== updatedRequest.decisionData.projectOwner.email ||
    updateData.primaryTechnicalLead.email !== updatedRequest.decisionData.primaryTechnicalLead.email ||
    updateData.secondaryTechnicalLead?.email !== updatedRequest.decisionData?.secondaryTechnicalLead?.email;

  await sendPrivateCloudNatsMessage(updatedRequest, contactsChanged);

  // For GOLD requests
  if (updatedRequest.decisionData.cluster === Cluster.GOLD) {
    const productData = { ...updatedRequest.decisionData, cluster: Cluster.GOLDDR };

    // 1. Handle CREATE request
    if (updatedRequest.type === RequestType.CREATE) {
      // 1.1. send GOLDDR nats message only if the flag is selected
      if (updatedRequest.decisionData.golddrEnabled) {
        await sendPrivateCloudNatsMessage(
          { id: updatedRequest.id, type: updatedRequest.type, decisionData: productData },
          contactsChanged,
        );
      }
    }
    // 2. Handle DELETE request
    else if (updatedRequest.type === RequestType.DELETE) {
      // 2.1. send GOLDDR nats message only if the flag is selected
      if (updatedRequest.project?.golddrEnabled) {
        await sendPrivateCloudNatsMessage(
          { id: updatedRequest.id, type: updatedRequest.type, decisionData: productData },
          contactsChanged,
        );
      }
    }
    // 3. Handle EDIT request
    else if (updatedRequest.type === RequestType.EDIT) {
      // 3.1. enable GOLDDR after creation of product.
      if (!updatedRequest.project?.golddrEnabled && updatedRequest.decisionData.golddrEnabled) {
        await sendPrivateCloudNatsMessage(
          { id: updatedRequest.id, type: RequestType.CREATE, decisionData: productData },
          contactsChanged,
        );
      }
      // 3.2. disable GOLDDR after creation of product.
      else if (updatedRequest.project?.golddrEnabled && !updatedRequest.decisionData.golddrEnabled) {
        await sendPrivateCloudNatsMessage(
          { id: updatedRequest.id, type: RequestType.DELETE, decisionData: productData },
          contactsChanged,
        );
      }
      // 3.3. update GOLDDR if still enabled
      else if (updatedRequest.project?.golddrEnabled && updatedRequest.decisionData.golddrEnabled) {
        await sendPrivateCloudNatsMessage(
          { id: updatedRequest.id, type: RequestType.EDIT, decisionData: productData },
          contactsChanged,
        );
      }
    }
  }
}
