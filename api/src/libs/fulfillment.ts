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
import { ROLE_IDS, DEFAULT_NAMESPACE_INITIAL_VALUE } from "../constants";
import DataManager from "../db";
import { Cluster } from "../db/model/cluster";
import { Contact } from "../db/model/contact";
import { ProjectProfile } from "../db/model/profile";
import { ProjectQuotaSize, ProjectSetQuotas } from "../db/model/quota";

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
import { replaceForDescription, getLicencePlatePostFix } from "./utils";

interface QuotasizeFormatInProvisonerFormat {
  cpu: string;
  memory: string;
  storage: string;
  snapshot: string;
}
const DEFAULT_NAMESPACE_QUOTAS: QuotasInNatsFormat = {
  cpu: {
    requests: 4,
    limits: 8,
  },
  memory: {
    requests: "16 Gi",
    limits: "32 Gi",
  },
  storage: {
    block: "100Gi",
    file: "100Gi",
    backup: "25Gi",
    capacity: "20",
    pvc_count: 20,
  },
  snapshot: { count: 5 },
};

const DEFAULT_PROJECT_SET_NAMESPACE_QUOTAS = {
  dev: DEFAULT_NAMESPACE_QUOTAS,
  test: DEFAULT_NAMESPACE_QUOTAS,
  tools: DEFAULT_NAMESPACE_QUOTAS,
  prod: DEFAULT_NAMESPACE_QUOTAS,
};

const DEFAULT_NAMESPACE_QUOTA_SIZE: QuotasizeFormatInProvisonerFormat = {
  cpu: DEFAULT_NAMESPACE_INITIAL_VALUE.quotaCpuSize,
  memory: DEFAULT_NAMESPACE_INITIAL_VALUE.quotaMemorySize,
  storage: DEFAULT_NAMESPACE_INITIAL_VALUE.quotaStorageSize,
  snapshot: DEFAULT_NAMESPACE_INITIAL_VALUE.quotaSnapshotSize,
};

const DEFAULT_PROJECT_SET_NAMESPACE_QUOTA_SIZE: ProjectSetQuotaSizeFormatInProvisonerFormat =
  {
    dev: { ...DEFAULT_NAMESPACE_QUOTA_SIZE },
    test: { ...DEFAULT_NAMESPACE_QUOTA_SIZE },
    tools: { ...DEFAULT_NAMESPACE_QUOTA_SIZE },
    prod: { ...DEFAULT_NAMESPACE_QUOTA_SIZE },
  };

interface ProjectSetQuotaSizeFormatInProvisonerFormat {
  dev: QuotasizeFormatInProvisonerFormat;
  test: QuotasizeFormatInProvisonerFormat;
  tools: QuotasizeFormatInProvisonerFormat;
  prod: QuotasizeFormatInProvisonerFormat;
}
interface ProjectSetQuotaSizeFormatInProvisonerFormat {
  dev: QuotasizeFormatInProvisonerFormat;
  test: QuotasizeFormatInProvisonerFormat;
  tools: QuotasizeFormatInProvisonerFormat;
  prod: QuotasizeFormatInProvisonerFormat;
}

interface QuotasInNatsFormat {
  cpu: {
    requests: number;
    limits: number;
  };
  memory: {
    requests: string;
    limits: string;
  };
  storage: {
    block: string;
    file: string;
    backup: string;
    capacity: string;
    pvc_count: number;
  };
  snapshot: { count: number };
}

interface ProjectSetQuotasInNatsFormat {
  dev: QuotasInNatsFormat;
  test: QuotasInNatsFormat;
  tools: QuotasInNatsFormat;
  prod: QuotasInNatsFormat;
}

export enum MergeType {
  Auto = "auto",
  Manual = "manual",
}
const PROJECT_SET = ["prod", "test", "dev", "tools"];

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

const makeNatsFormatQuotaSizeMessage = (
  quotaSize: ProjectQuotaSize
): ProjectSetQuotaSizeFormatInProvisonerFormat => {
  const provisonerPreferedFormatQuotasize: ProjectSetQuotaSizeFormatInProvisonerFormat =
    DEFAULT_PROJECT_SET_NAMESPACE_QUOTA_SIZE;
  const namespaceObjectKey = Object.keys(quotaSize);
  namespaceObjectKey.forEach((namespace) => {
    provisonerPreferedFormatQuotasize[namespace] = {
      cpu: quotaSize[namespace]?.quotaCpuSize,
      memory: quotaSize[namespace]?.quotaMemorySize,
      storage: quotaSize[namespace]?.quotaStorageSize,
      snapshot: quotaSize[namespace]?.quotaSnapshotSize,
    };
  });
  return provisonerPreferedFormatQuotasize;
};

const makeNatsFormatQuotasMessage = (
  quotas: ProjectSetQuotas
): ProjectSetQuotasInNatsFormat => {
  const namespaceObjectKey = Object.keys(quotas);
  const provisonerPreferedFormatQuotas: ProjectSetQuotasInNatsFormat =
    DEFAULT_PROJECT_SET_NAMESPACE_QUOTAS;
  namespaceObjectKey.forEach((namespace) => {
    provisonerPreferedFormatQuotas[namespace] = {
      cpu: {
        ...quotas[namespace].cpu,
      },
      memory: {
        ...quotas[namespace].memory,
      },
      storage: {
        block: quotas[namespace].storage.block,
        file: quotas[namespace].storage.file,
        backup: quotas[namespace].storage.backup,
        capacity: quotas[namespace].storage.capacity,
        pvc_count: quotas[namespace].storage.pvcCount,
      },
      snapshot: { count: quotas[namespace].snapshot.count },
    };
  });
  return provisonerPreferedFormatQuotas;
};

// This function can build namespace field for Nats message
export const buildNatsMessageFields = async (
  profile: ProjectProfile,
  quotaSize: ProjectQuotaSize,
  quotas: ProjectSetQuotas
) => {
  const provisonerPreferedFormatQuotasize: ProjectSetQuotaSizeFormatInProvisonerFormat =
    makeNatsFormatQuotaSizeMessage(quotaSize);

  const provisonerPreferedFormatQuotas: ProjectSetQuotasInNatsFormat =
    makeNatsFormatQuotasMessage(quotas);

  const namespacesDetails = await NamespaceModel.findNamespacesForProfile(
    profile.id
  );

  const namespaces = namespacesDetails.map((n) => {
    const namespacePostFix = getLicencePlatePostFix(n.name);
    return formatNamespacesForNats(
      n,
      provisonerPreferedFormatQuotasize[namespacePostFix],
      provisonerPreferedFormatQuotas[namespacePostFix]
    );
  });
  return namespaces;
};
export const buildContext = async (
  action: NatsContextAction,
  profile: ProjectProfile,
  profileContacts: Contact[],
  namespaces: any,
  cluster: Cluster,
  auoMergeFlag: string
): Promise<NatsContext> => {
  try {
    if (!profile.id) {
      throw new Error("Cant get profile id");
    }

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
      ministry_id: profile.busOrgId,
      merge_type: auoMergeFlag,
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
  isForSync: boolean = false,
  isForDelete: boolean = false
): Promise<NatsContext> => {
  try {
    const auoMergeFlag: string = MergeType.Auto;
    let action = NatsContextAction.Create;
    if (isForSync) {
      action = NatsContextAction.Sync;
    } else if (isForDelete) {
      action = NatsContextAction.Delete;
    }

    const profile: ProjectProfile = await ProfileModel.findById(profileId);
    const contacts: Contact[] = await ContactModel.findForProject(profileId);
    const quotaSize: ProjectQuotaSize = await getQuotaSize(profile);
    const quotas: ProjectSetQuotas =
      await QuotaModel.fetchProjectSetQuotaDetail(quotaSize);

    const namespaces = await buildNatsMessageFields(profile, quotaSize, quotas);

    return await buildContext(
      action,
      profile,
      contacts,
      namespaces,
      cluster,
      auoMergeFlag
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
    let contacts: Contact[];
    const auoMergeFlag: string = MergeType.Auto;

    if (requestEditType === RequestEditType.ProjectProfile) {
      profile = JSON.parse(requestEditObject);
    } else {
      profile = await ProfileModel.findById(profileId);
    }

    const quotaSize: ProjectQuotaSize = await getQuotaSize(profile);
    const quotas: ProjectSetQuotas =
      await QuotaModel.fetchProjectSetQuotaDetail(quotaSize);

    if (requestEditType === RequestEditType.QuotaSize) {
      const editNamespacePostFix = getLicencePlatePostFix(
        requestEditObject.namespace
      );
      if (editNamespacePostFix && PROJECT_SET.includes(editNamespacePostFix)) {
        quotaSize[editNamespacePostFix] = requestEditObject.quota;

        quotas[editNamespacePostFix] = requestEditObject.quotas;
      } else {
        const errMessage =
          "Editing quota namespace name is not been provided in edit object, It is required in quota edit process. throwing error in contextForEditing";
        throw new Error(`${errMessage}: ProfileID is: ${profileId}`);
      }
    }

    const namespaces = await buildNatsMessageFields(profile, quotaSize, quotas);

    if (requestEditType === RequestEditType.Contacts) {
      contacts = JSON.parse(requestEditObject);
    } else {
      contacts = await ContactModel.findForProject(profileId);
    }

    return await buildContext(
      action,
      profile,
      contacts,
      namespaces,
      cluster,
      auoMergeFlag
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
    case RequestType.Delete:
      if (!request.editType) {
        throw new Error(`Invalid edit type for request ${request.id}`);
      }
      return contextForProvisioning(request.profileId, cluster, false, true);
    default:
      throw new Error(`Invalid type for request ${request.id}`);
  }
};

export const sendNatsMessage = async (
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
