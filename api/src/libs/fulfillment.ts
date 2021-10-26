//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { logger } from "@bcgov/common-nodejs-utils";
import config from "../config";
import { ROLE_IDS } from "../constants";
import DataManager from "../db";
import { Cluster } from "../db/model/cluster";
import { Contact } from "../db/model/contact";
import { ProjectProfile } from "../db/model/profile";
import { ProjectQuotaSize, Quotas, QuotaSize } from "../db/model/quota";
import {
  BotMessage,
  Request,
  RequestEditType,
  RequestType,
} from "../db/model/request";
import {
  NatsContact,
  NatsContactRole,
  NatsContext,
  NatsContextAction,
  NatsMessage,
  NatsProjectNamespace,
} from "../types";
import { getQuotaSize } from "./profile";
import shared from "./shared";
import { replaceForDescription } from "./utils";

interface ProvisonerPreferedFormatQuotasizeFormat {
  cpu: QuotaSize;
  memory: QuotaSize;
  storage: QuotaSize;
}

const dm = new DataManager(shared.pgPool);
const { ProfileModel, ContactModel, QuotaModel, NamespaceModel, RequestModel } =
  dm;

const formatNamespacesForNats = (
  namespace,
  quota,
  quotas
): NatsProjectNamespace => ({
  namespace_id: namespace.id,
  name: namespace.name,
  quota,
  quotas,
});

const formatContactsForNats = (contact): NatsContact => ({
  user_id: contact.githubId,
  provider: "github", // TODO:(JL) Fix as part of #94.
  email: contact.email,
  rocketchat_username: null, // TODO:(SB) Update when rocketchat func is implemented
  role:
    contact.roleId === ROLE_IDS.TECHNICAL_CONTACT
      ? NatsContactRole.Lead
      : NatsContactRole.Owner,
});

const buildContext = async (
  action: NatsContextAction,
  profile: ProjectProfile,
  profileContacts: Contact[],
  quotaSize: ProvisonerPreferedFormatQuotasizeFormat,
  quotas: Quotas,
  cluster: Cluster
): Promise<NatsContext> => {
  try {
    if (!profile.id) {
      throw new Error("Cant get profile id");
    }

    // TODO:(sb) Find a more robust solution to convert quotas to snake_case
    // @ts-ignore
    delete Object.assign(quotas.storage, { pvc_count: quotas.storage.pvcCount })
      .pvcCount;

    const namespacesDetails = await NamespaceModel.findNamespacesForProfile(
      profile.id
    );

    const namespaces = namespacesDetails.map((n) =>
      formatNamespacesForNats(n, quotaSize, quotas)
    );

    const contacts: NatsContact[] = profileContacts.map((contact) =>
      formatContactsForNats(contact)
    );

    if (!profile || !namespaces || !cluster.id || contacts.length === 0) {
      throw new Error("Missing arguments to build nats context");
    }

    return {
      action,
      profile_id: profile.id,
      cluster_id: cluster.id,
      cluster_name: cluster.name,
      display_name: profile.name,
      description: profile.description,
      namespaces,
      contacts,
    };
  } catch (err) {
    const message = `Unable to build context for profile ${profile.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

// TODO: modify around isForSync so as to avoid passing bool directly
export const contextForProvisioning = async (
  profileId: number,
  cluster: Cluster,
  isForSync: boolean = false
): Promise<NatsContext> => {
  try {
    const action = isForSync
      ? NatsContextAction.Sync
      : NatsContextAction.Create;
    const profile: ProjectProfile = await ProfileModel.findById(profileId);
    const contacts: Contact[] = await ContactModel.findForProject(profileId);
    const quotaSize: ProjectQuotaSize = await getQuotaSize(profile);
    const quotas: Quotas = await QuotaModel.findForQuotaSize(quotaSize);
    const ProvisonerPreferedFormatQuotasize: ProvisonerPreferedFormatQuotasizeFormat =
      {
        cpu: quotaSize.quotaCpuSize || QuotaSize.Small,
        memory: quotaSize.quotaMemorySize || QuotaSize.Small,
        storage: quotaSize.quotaStorageSize || QuotaSize.Small,
      };
    return await buildContext(
      action,
      profile,
      contacts,
      ProvisonerPreferedFormatQuotasize,
      quotas,
      cluster
    );
  } catch (err) {
    const message = `Unable to create context for provisioning ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const contextForEditing = async (
  profileId: number,
  requestEditType: RequestEditType,
  requestEditObject: any,
  cluster: Cluster
): Promise<NatsContext> => {
  try {
    const action = NatsContextAction.Edit;
    let profile: ProjectProfile;
    let quotaSize: ProjectQuotaSize;
    let quotas: Quotas;
    let contacts: Contact[];

    if (requestEditType === RequestEditType.ProjectProfile) {
      profile = JSON.parse(requestEditObject);
    } else {
      profile = await ProfileModel.findById(profileId);
    }

    if (requestEditType === RequestEditType.QuotaSize) {
      quotaSize = requestEditObject.quota;
      quotas = requestEditObject.quotas;
    } else {
      quotaSize = await getQuotaSize(profile);
      quotas = await QuotaModel.findForQuotaSize(quotaSize);
    }

    const ProvisonerPreferedFormatQuotasize: ProvisonerPreferedFormatQuotasizeFormat =
      {
        cpu: quotaSize.quotaCpuSize,
        memory: quotaSize.quotaMemorySize,
        storage: quotaSize.quotaStorageSize,
      };

    if (requestEditType === RequestEditType.Contacts) {
      contacts = JSON.parse(requestEditObject);
    } else {
      contacts = await ContactModel.findForProject(profileId);
    }
    return await buildContext(
      action,
      profile,
      contacts,
      ProvisonerPreferedFormatQuotasize,
      quotas,
      cluster
    );
  } catch (err) {
    const message = `Unable to create context for updating ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

const generateContext = async (
  request: Request,
  cluster: Cluster
): Promise<NatsContext> => {
  switch (request.type) {
    case RequestType.Create:
      return contextForProvisioning(request.profileId, cluster);
    case RequestType.Edit:
      if (!request.editType) {
        throw new Error(`Invalid edit type for request ${request.id}`);
      }
      return contextForEditing(
        request.profileId,
        request.editType,
        request.editObject,
        cluster
      );
    default:
      throw new Error(`Invalid type for request ${request.id}`);
  }
};

const sendNatsMessage = async (
  profileId: number,
  natsMessage: NatsMessage
): Promise<NatsMessage> => {
  try {
    const nc = shared.nats;
    const { natsSubject, natsContext } = natsMessage;
    nc.on("error", () => {
      const errmsg = `NATS error sending order ${profileId} to ${natsSubject}`;
      throw new Error(errmsg);
    });

    logger.info(`Sending NATS message for ${profileId} to ${natsSubject}`);

    nc.publish(natsSubject, replaceForDescription(natsContext));
    logger.info(`NATS Message sent for ${profileId} to ${natsSubject}`);

    nc.flush(() => {
      nc.removeAllListeners(["error"]);
    });

    return natsMessage;
  } catch (err) {
    const message = `Unable to send nats message for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const fetchBotMessageRequests = async (
  requestId: number
): Promise<BotMessage[]> => {
  try {
    return await RequestModel.findActiveBotMessagesByRequestId(requestId);
  } catch (err) {
    const message = `Unable to fetch existing bot message requests for request ${requestId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

const createBotMessageSet = async (
  request: Request,
  subjectPrefix: string
): Promise<any> => {
  const clusters = await NamespaceModel.findClustersForProfile(
    request.profileId
  );

  for (const cluster of clusters) {
    await RequestModel.createBotMessage({
      requestId: Number(request.id),
      natsSubject: subjectPrefix.concat(cluster.name),
      natsContext: await generateContext(request, cluster),
      clusterName: cluster.name,
      receivedCallback: false,
    });
  }
};

export const fulfillRequest = async (request: Request): Promise<any> => {
  try {
    const subjectPrefix: string = config.get("nats:subjectPrefix");

    await createBotMessageSet(request, subjectPrefix);
    const botMessageSet = await fetchBotMessageRequests(Number(request.id));
    for (const botMessage of botMessageSet) {
      await sendNatsMessage(request.profileId, {
        natsSubject: botMessage.natsSubject,
        natsContext: botMessage.natsContext,
      });
    }
  } catch (err) {
    const message = `Unable to fulfill edit request for profile ${request.profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};
