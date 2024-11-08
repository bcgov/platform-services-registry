import { RequestType } from '@prisma/client';
import { PRIVATE_NATS_URL, PUBLIC_NATS_URL } from '@/config';
import openshiftDeletionCheck, { DeletableField } from '@/helpers/openshift';
import createPrivateCloudNatsMessage from '@/services/nats/private-cloud';
import createPublicCloudNatsMessage from '@/services/nats/public-cloud';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
import { PublicCloudRequestDetailDecorated } from '@/types/public-cloud';
import { sendNatsMessage } from './core';

export async function sendPrivateCloudNatsMessage(
  request: Pick<PrivateCloudRequestDetail, 'id' | 'type' | 'decisionData'>,
  contactChanged: boolean,
) {
  const decisionData = request.decisionData;
  const natsSubject = `registry_project_provisioning_${decisionData.cluster}`.toLocaleLowerCase();

  // Perform deletion check if request is a delete request
  if (request.type === RequestType.DELETE || request.type.toLowerCase() === 'delete') {
    const deleteCheckList: DeletableField = await openshiftDeletionCheck(
      decisionData.licencePlate,
      decisionData.cluster,
    );

    if (!Object.values(deleteCheckList).every((field) => field)) {
      throw new Error(
        'This project is not deletable as it is not empty. Please delete all resources before deleting the project.',
      );
    }
  }

  const messageBody = createPrivateCloudNatsMessage(request, contactChanged);

  await sendNatsMessage(PRIVATE_NATS_URL, natsSubject, messageBody);
}

export async function sendPublicCloudNatsMessage(
  request: Pick<PublicCloudRequestDetailDecorated, 'id' | 'type' | 'project' | 'decisionData'>,
) {
  const decisionData = request.decisionData;
  const natsSubject = `registry_project_provisioning_${decisionData.provider.toLocaleLowerCase()}`;

  const messageBody = createPublicCloudNatsMessage(request);

  await sendNatsMessage(PUBLIC_NATS_URL, natsSubject, messageBody);
}
