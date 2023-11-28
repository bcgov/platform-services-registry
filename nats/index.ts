import { connect, StringCodec, JSONCodec } from 'nats';
import createPrivateCloudNatsMessage, { PrivateCloudRequestedProjectWithContacts } from '@/nats/privateCloud';
import createPublicCloudNatsMessage, {
  PublicCloudRequestedProjectWithContacts,
  PublicCloudProjectWithContacts,
} from '@/nats/publicCloud';
import openshiftDeletionCheck, { DeletableField } from '@/scripts/deletioncheck';
import { RequestType, PrivateCloudRequest } from '@prisma/client';

const serverURL = `${process.env.NATS_HOST}:${process.env.NATS_PORT}`;

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
