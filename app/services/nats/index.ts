import { PRIVATE_NATS_URL, PUBLIC_NATS_URL } from '@/config';
import { RequestType } from '@/prisma/client';
import { isEligibleForDeletion } from '@/services/k8s/reads';
import createPrivateCloudNatsMessage from '@/services/nats/private-cloud';
import createPublicCloudNatsMessage from '@/services/nats/public-cloud';
import { PrivateCloudRequestDetailDecorated } from '@/types/private-cloud';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';
import { sendNatsMessage } from './core';

export async function sendPrivateCloudNatsMessage(
  request: Pick<PrivateCloudRequestDetailDecorated, 'id' | 'type' | 'decisionData'>,
  contactChanged: boolean,
) {
  const decisionData = request.decisionData;
  const natsSubject = `registry_project_provisioning_${decisionData.cluster}`.toLocaleLowerCase();

  // Perform deletion check if request is a delete request
  if (request.type === RequestType.DELETE || request.type.toLowerCase() === 'delete') {
    const canDelete = await isEligibleForDeletion(decisionData.licencePlate, decisionData.cluster);

    if (!canDelete) {
      throw new Error(
        'This project is not deletable as it is not empty. Please delete all resources before deleting the project.',
      );
    }
  }

  const messageBody = await createPrivateCloudNatsMessage(request, contactChanged);

  await sendNatsMessage(PRIVATE_NATS_URL, natsSubject, messageBody);
}

export async function sendPublicCloudNatsMessage(
  request: Pick<PublicCloudRequestDetailDecorated, 'id' | 'type' | 'project' | 'decisionData'>,
) {
  const decisionData = request.decisionData;
  const natsSubject = `registry_project_provisioning_${decisionData.provider.toLocaleLowerCase()}`;

  const messageBody = await createPublicCloudNatsMessage(request);

  await sendNatsMessage(PUBLIC_NATS_URL, natsSubject, messageBody);
}
