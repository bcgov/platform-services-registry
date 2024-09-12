import { PrivateCloudRequest, RequestType } from '@prisma/client';
import { PRIVATE_NATS_URL, PUBLIC_NATS_URL } from '@/config';
import openshiftDeletionCheck, { DeletableField } from '@/helpers/openshift';
import createPrivateCloudNatsMessage, { PrivateCloudRequestedProjectWithContacts } from '@/services/nats/private-cloud';
import createPublicCloudNatsMessage, {
  PublicCloudProjectWithContacts,
  PublicCloudRequestedProjectWithContacts,
} from '@/services/nats/public-cloud';
import { sendNatsMessage } from './core';

export async function sendPrivateCloudNatsMessage(
  requestId: PrivateCloudRequest['id'],
  requestType: RequestType,
  decisionData: PrivateCloudRequestedProjectWithContacts,
  contactChanged: boolean,
) {
  const natsSubject = `registry_project_provisioning_${decisionData.cluster}`.toLocaleLowerCase();

  // Perform deletion check if request is a delete request
  if (requestType === RequestType.DELETE || requestType.toLowerCase() === 'delete') {
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

  const messageBody = createPrivateCloudNatsMessage(requestId, requestType, decisionData, contactChanged);

  await sendNatsMessage(PRIVATE_NATS_URL, natsSubject, messageBody);
}

export async function sendPublicCloudNatsMessage(
  requestType: RequestType,
  decisionData: PublicCloudRequestedProjectWithContacts,
  currentProject?: PublicCloudProjectWithContacts | null,
) {
  const natsSubject = `registry_project_provisioning_${decisionData.provider.toLocaleLowerCase()}`;

  const messageBody = createPublicCloudNatsMessage(requestType, decisionData, currentProject);

  await sendNatsMessage(PUBLIC_NATS_URL, natsSubject, messageBody);
}
