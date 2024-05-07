import { JSONCodec, StringCodec, connect } from 'nats';
import createPrivateCloudNatsMessage, { PrivateCloudRequestedProjectWithContacts } from '@/services/nats/private-cloud';
import createPublicCloudNatsMessage, {
  PublicCloudProjectWithContacts,
  PublicCloudRequestedProjectWithContacts,
} from '@/services/nats/public-cloud';
import openshiftDeletionCheck, { DeletableField } from '@/helpers/openshift';
import { PrivateCloudRequest, RequestType } from '@prisma/client';
import { PRIVATE_NATS_HOST, PRIVATE_NATS_PORT, PUBLIC_NATS_HOST, PUBLIC_NATS_PORT } from '@/config';
import { logger } from '@/core/logging';

const privateNatsUrl = `${PRIVATE_NATS_HOST}:${PRIVATE_NATS_PORT}`;
const publicNatsUrl = `${PUBLIC_NATS_HOST}:${PUBLIC_NATS_PORT}`;

async function sendNatsMessage(natsUrl: string, natsSubject: string, messageBody: any) {
  try {
    logger.info('sending NATS', {
      details: {
        url: natsUrl,
        sub: natsSubject,
        msg: messageBody,
      },
    });

    const nc = await connect({ servers: natsUrl });

    // const sc = StringCodec();
    const jc = JSONCodec();

    nc.publish(natsSubject, jc.encode(messageBody));

    await nc.drain();
  } catch (error) {
    logger.error('sendNatsMessage:', error);
  }
}

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

  await sendNatsMessage(privateNatsUrl, natsSubject, messageBody);
}

export async function sendPublicCloudNatsMessage(
  requestType: RequestType,
  decisionData: PublicCloudRequestedProjectWithContacts,
  currentProject?: PublicCloudProjectWithContacts | null,
) {
  const natsSubject = 'registry_project_provisioning_aws';

  const messageBody = createPublicCloudNatsMessage(requestType, decisionData, currentProject);

  await sendNatsMessage(publicNatsUrl, natsSubject, messageBody);
}
