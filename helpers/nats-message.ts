import { $Enums, Cluster } from '@prisma/client';
import { PrivateCloudRequestWithProjectAndRequestedProject } from '@/request-actions/private-cloud/decision-request';
import { sendPrivateCloudNatsMessage } from '@/services/nats';

interface User {
  email?: string;
}

export async function sendRequestNatsMessage(
  updatedRequest: PrivateCloudRequestWithProjectAndRequestedProject,
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

  await sendPrivateCloudNatsMessage(
    updatedRequest.id,
    updatedRequest.type,
    updatedRequest.decisionData,
    contactsChanged,
  );

  // For GOLD requests
  if (updatedRequest.decisionData.cluster === Cluster.GOLD) {
    const productData = { ...updatedRequest.decisionData, cluster: Cluster.GOLDDR };

    // 1. Handle CREATE request
    if (updatedRequest.type === $Enums.RequestType.CREATE) {
      // 1.1. send GOLDDR nats message only if the flag is selected
      if (updatedRequest.decisionData.golddrEnabled) {
        await sendPrivateCloudNatsMessage(updatedRequest.id, updatedRequest.type, productData, contactsChanged);
      }
    }
    // 2. Handle DELETE request
    else if (updatedRequest.type === $Enums.RequestType.DELETE) {
      // 2.1. send GOLDDR nats message only if the flag is selected
      if (updatedRequest.project?.golddrEnabled) {
        await sendPrivateCloudNatsMessage(updatedRequest.id, updatedRequest.type, productData, contactsChanged);
      }
    }
    // 3. Handle EDIT request
    else if (updatedRequest.type === $Enums.RequestType.EDIT) {
      // 3.1. enable GOLDDR after creation of product.
      if (!updatedRequest.project?.golddrEnabled && updatedRequest.decisionData.golddrEnabled) {
        await sendPrivateCloudNatsMessage(updatedRequest.id, $Enums.RequestType.CREATE, productData, contactsChanged);
      }
      // 3.2. disable GOLDDR after creation of product.
      else if (updatedRequest.project?.golddrEnabled && !updatedRequest.decisionData.golddrEnabled) {
        await sendPrivateCloudNatsMessage(updatedRequest.id, $Enums.RequestType.DELETE, productData, contactsChanged);
      }
      // 3.3. update GOLDDR if still enabled
      else if (updatedRequest.project?.golddrEnabled && updatedRequest.decisionData.golddrEnabled) {
        await sendPrivateCloudNatsMessage(updatedRequest.id, $Enums.RequestType.EDIT, productData, contactsChanged);
      }
    }
  }
}
