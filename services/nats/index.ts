import { JSONCodec, StringCodec, connect } from 'nats';
import createPrivateCloudNatsMessage, { PrivateCloudRequestedProjectWithContacts } from '@/services/nats/private-cloud';
import createPublicCloudNatsMessage, {
  PublicCloudProjectWithContacts,
  PublicCloudRequestedProjectWithContacts,
} from '@/services/nats/public-cloud';
import openshiftDeletionCheck, { DeletableField } from '@/helpers/openshift';
import { PrivateCloudRequest, RequestType } from '@prisma/client';
import { NATS_HOST, NATS_PORT } from '@/config';

const serverURL = `${NATS_HOST}:${NATS_PORT}`;

async function sendNatsMessage(natsSubject: string, messageBody: any) {
  try {
    console.log('NATS SERVER URL: ', serverURL);
    console.log('NATS SUBJECT: ', natsSubject);
    console.log('MESSAGE BODY: ', JSON.stringify(messageBody));

    const nc = await connect({ servers: serverURL });

    // const sc = StringCodec();
    const jc = JSONCodec();

    nc.publish(natsSubject, jc.encode(messageBody));

    await nc.drain();
  } catch (e) {
    console.log(`Error sending NATS message with subject: ${natsSubject}`, e);
  }
}

export async function sendPrivateCloudNatsMessage(
  requestId: PrivateCloudRequest['id'],
  requestType: RequestType,
  requestedProject: PrivateCloudRequestedProjectWithContacts,
  contactChanged: boolean,
) {
  const natsSubject = `registry_project_provisioning_${requestedProject.cluster}`.toLocaleLowerCase();

  // Perform deletion check if request is a delete request
  if (requestType === RequestType.DELETE || requestType.toLowerCase() === 'delete') {
    const deleteCheckList: DeletableField = await openshiftDeletionCheck(
      requestedProject.licencePlate,
      requestedProject.cluster,
    );

    if (!Object.values(deleteCheckList).every((field) => field)) {
      throw new Error(
        'This project is not deletable as it is not empty. Please delete all resources before deleting the project.',
      );
    }
  }

  const messageBody = createPrivateCloudNatsMessage(requestId, requestType, requestedProject, contactChanged);

  await sendNatsMessage(natsSubject, messageBody);
}

export async function sendPublicCloudNatsMessage(
  requestType: RequestType,
  requestedProject: PublicCloudRequestedProjectWithContacts,
  currentProject?: PublicCloudProjectWithContacts | null,
) {
  const natsSubject = 'registry_project_provisioning_aws';

  const messageBody = createPublicCloudNatsMessage(requestType, requestedProject, currentProject);

  await sendNatsMessage(natsSubject, messageBody);
}
