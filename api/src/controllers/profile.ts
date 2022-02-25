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

import { errorWithCode, logger } from "@bcgov/common-nodejs-utils";
import { Response } from "express";
import axios from "axios";
import { PROFILE_STATUS } from "../constants";
import DataManager from "../db";
// import config from "../config";
// import { NatsContext, NatsContextAction } from "../types";
import { Contact } from "../db/model/contact";
import { ProjectProfile, DeletableField } from "../db/model/profile";
import {
  ProjectQuotaSize,
  //  ProjectSetQuotas
} from "../db/model/quota";
import { Request } from "../db/model/request";
import { comparerContact } from "../db/utils";
import { AuthenticatedUser } from "../libs/authmware";
import {
  fulfillRequest,
  // sendNatsMessage,
  // buildNatsMessageFields,
} from "../libs/fulfillment";
import { getQuotaSize, updateProfileStatus } from "../libs/profile";
import {
  requestProfileContactsEdit,
  requestProfileQuotaSizeEdit,
  requestProjectProfileCreate,
  requestProjectProfileDelete,
} from "../libs/request";
import shared from "../libs/shared";
import fetchAllDashboardProjects from "../services/profile";
import { ProjectSetNamespace } from "../db/model/namespace";

const dm = new DataManager(shared.pgPool);

export const addContactToProfile = async (
  { params }: { params: any },
  res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId, contactId } = params;

  try {
    await ProfileModel.addContactToProfile(
      Number(profileId),
      Number(contactId)
    );

    res.status(201).end();
  } catch (err) {
    const message = `Unable to add contact to profile`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProfileContacts = async (
  { params }: { params: any },
  res: Response
): Promise<void> => {
  const { ContactModel } = dm;
  const { profileId } = params;

  try {
    const projectContacts = await ContactModel.findForProject(
      Number(profileId)
    );

    res.status(200).json(projectContacts);
  } catch (err) {
    if (err.code) {
      throw err;
    }

    const message = `Unable fetch profile contacts with profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const updateProfileContacts = async (
  {
    params,
    body,
    user,
  }: { params: any; body: Contact[]; user: AuthenticatedUser },
  res: Response
): Promise<void> => {
  const { ContactModel, RequestModel } = dm;
  const { profileId } = params;
  const contacts = body;
  // TODO (yhf): add more data sanity check
  // check the passed contacts have no dupliates
  // check contact_id is associated with the queried profile_id
  // check role_id points to the legit role TC / PO

  try {
    const currentContacts: Contact[] = await ContactModel.findForProject(
      Number(profileId)
    );
    const deletedOrNewContact: boolean = true;
    const provisionerContactEdit: boolean[] = [];

    const removeExistingContact = currentContacts.filter(
      comparerContact(contacts, "id")
    );
    const addNewContact = contacts.filter(
      comparerContact(currentContacts, "id")
    );
    const AddOrRemoveContact = removeExistingContact.concat(addNewContact);

    // 1. Check for provisioner related changes
    if (AddOrRemoveContact.length !== 0) {
      provisionerContactEdit.push(deletedOrNewContact);
    } else {
      contacts.forEach((contact: Contact): void => {
        const currentContact = currentContacts
          .filter((cc) => cc.id === contact.id)
          .pop();
        if (currentContact) {
          provisionerContactEdit.push(
            currentContact.githubId !== contact.githubId
          );
          provisionerContactEdit.push(currentContact.email !== contact.email);
        }
      });
    }

    // 2. Create request if provisionerRelatedChanges
    const isProvisionerRelatedChanges = provisionerContactEdit.some(
      (contactEdit) => contactEdit
    );

    if (isProvisionerRelatedChanges) {
      const editRequest = await requestProfileContactsEdit(
        Number(profileId),
        contacts,
        user
      );
      await fulfillRequest(editRequest);
      return res.status(202).end();
    }

    // 3. Update DB if changes are trivial (contact name)
    const request = await requestProfileContactsEdit(
      Number(profileId),
      body,
      user
    );

    const contactPromises = contacts.map((contact: Contact) => {
      if (!contact.id) {
        throw new Error("Cant get contact id");
      }
      return ContactModel.update(contact.id, contact);
    });
    await Promise.all(contactPromises);

    await updateProfileStatus(Number(profileId), PROFILE_STATUS.PROVISIONED);
    await RequestModel.updateCompletionStatus(Number(request.id));

    return res.status(204).end();
  } catch (err) {
    const message = `Unable to update contacts with profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProfileQuotaSize = async (
  { params }: { params: any },
  res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId } = params;

  try {
    const profile: ProjectProfile = await ProfileModel.findById(
      Number(profileId)
    );

    const quotaSize: ProjectQuotaSize = await getQuotaSize(profile);

    res.status(200).json(quotaSize);
  } catch (err) {
    if (err.code) {
      throw err;
    }

    const message = `Unable fetch profile quota size with profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const updateProfileQuotaSize = async (
  { params, body, user }: { params: any; body: any; user: AuthenticatedUser },
  res: Response
): Promise<void> => {
  const { profileId } = params;
  const { requestedQuotaSize, namespace } = body;

  try {
    const requiresHumanAction = true;

    await requestProfileQuotaSizeEdit(
      Number(profileId),
      requestedQuotaSize,
      user,
      requiresHumanAction,
      namespace
    );

    res.status(204).end();
  } catch (err) {
    const message = `Unable to update quota-size for profile ${profileId} namespace ${namespace}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProfileEditRequests = async (
  { params }: { params: any },
  res: Response
): Promise<void> => {
  const { RequestModel } = dm;
  const { profileId } = params;

  try {
    const editRequests: Request[] = await RequestModel.findForProfile(
      Number(profileId)
    );

    res.status(200).json(editRequests);
  } catch (err) {
    if (err.code) {
      throw err;
    }

    const message = `Unable to fetch profile edit requests with profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const createProjectRequest = async (
  { params, user }: { params: any; user: AuthenticatedUser },
  res: Response
): Promise<void> => {
  const { profileId } = params;
  try {
    const requiresHumanAction = true;
    await requestProjectProfileCreate(
      Number(profileId),
      user,
      requiresHumanAction
    );

    res.status(201).end();
  } catch (err) {
    const message = `Unable to add contact to profile`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const deleteProfileRequest = async (
  { params, user }: { params: any; body: any; user: AuthenticatedUser },
  res: Response
) => {
  const { profileId } = params;

  try {
    const requiresHumanAction = true;
    await requestProjectProfileDelete(
      Number(profileId),
      user,
      requiresHumanAction
    );

    res.status(201).end();
  } catch (err) {
    const message = `Unable to add contact to profile`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};
export const openshiftDeletionCheck = async (
  namespacePrefix: string,
  clusterName: string
): Promise<DeletableField> => {
  const CLUSTER_SERVICE_ACCOUNT_TOKEN = {
    clab: process.env.CLAB_SERVICE_ACCOUNT_TOKEN || "",
    klab: process.env.KLAB_SERVICE_ACCOUNT_TOKEN || "",
    golddr: process.env.GOLDDR_SERVICE_ACCOUNT_TOKEN || "",
    gold: process.env.GOLD_SERVICE_ACCOUNT_TOKEN || "",
    silver: process.env.SILVER_SERVICE_ACCOUNT_TOKEN || "",
  };
  const url = `https://api.${clusterName}.devops.gov.bc.ca:6443`;
  const BEARER_TOKEN = `Bearer ${CLUSTER_SERVICE_ACCOUNT_TOKEN[clusterName]}`;

  const OC_HEADER = {
    Authorization: BEARER_TOKEN,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const checkResult: DeletableField = {
    namespaceDeletability: false,
    podsDeletability: false,
    pvcDeletability: false,
    provisionerDeletionChecked: true,
  };

  // Namespaces check
  const allNamespacesUnderProject = Object.keys(ProjectSetNamespace).map(
    (element) => `${namespacePrefix}-${ProjectSetNamespace[element]}`
  );

  try {
    const namespaceCheckUrl = `${url}/api/v1/namespaces`;
    const { data } = await axios.get(`${namespaceCheckUrl}`, {
      headers: OC_HEADER,
      withCredentials: true,
    });
    const allAvailableNamespacesOnCluster = data.items.map(
      (item) => item.metadata.name
    );
    const checker = (arr: string[], target: string[]) =>
      target.every((v) => arr.includes(v));

    checkResult.namespaceDeletability = checker(
      allAvailableNamespacesOnCluster,
      allNamespacesUnderProject
    );
  } catch (err) {
    const message = `Namespace check failed, can not fetch all namespaces in cluster`;
    logger.error(`${message}, err = ${err.data.message}`);
    checkResult.namespaceDeletability = false;

    return checkResult;
  }

  if (checkResult.namespaceDeletability) {
    try {
      // Pod and pvcdeletion checkcheck
      const allPodInProject: any = [];
      const podResponse = await Promise.all(
        allNamespacesUnderProject.map(async (namespace) =>
          axios.get(`${`${url}/api/v1/namespaces/${namespace}/pods`}`, {
            headers: OC_HEADER,
            withCredentials: true,
          })
        )
      );
      podResponse.forEach((namespace) =>
        namespace.data.items.forEach((pod: any) =>
          allPodInProject.push(pod.status)
        )
      );

      checkResult.podsDeletability = allPodInProject.every(
        (pod) => pod.phase !== "Running" && pod.phase !== "Pending"
      );

      const pvcResponse = await Promise.all(
        allNamespacesUnderProject.map(async (namespace) =>
          axios.get(
            `${`${url}/api/v1/namespaces/${namespace}/persistentvolumeclaims`}`,
            {
              headers: OC_HEADER,
              withCredentials: true,
            }
          )
        )
      );
      const allPVCInProject = pvcResponse.map(
        (namespace) => namespace.data.items
      );

      checkResult.pvcDeletability = allPVCInProject.every(
        (namespacePVC) => namespacePVC.length === 0
      );
    } catch (err) {
      const message = `pod and pvc check failed, can not fetch info from namespaces`;
      logger.error(`${message}, err = ${err.message}`);
      checkResult.pvcDeletability = false;
      checkResult.podsDeletability = false;

      return checkResult;
    }
  }

  return checkResult;
};

export const updateDeletionCheckStatus = async (
  { params }: { params: any; body: any },
  res: Response
) => {
  const { profileId } = params;
  // const subjectPrefix: string = config.get("nats:subjectPrefix");
  const DEFAULT_DELETION_STATUS: DeletableField = {
    pvcDeletability: false,
    namespaceDeletability: false,
    podsDeletability: false,
    provisionerDeletionChecked: true,
  };
  try {
    const {
      NamespaceModel,
      ProfileModel,
      // QuotaModel
    } = dm;
    const clusters = await NamespaceModel.findClustersForProfile(profileId);
    const profile: ProjectProfile = await ProfileModel.findById(profileId);
    const promise: Promise<DeletableField>[] = [];

    // Go through all culster to do the deletion check.
    clusters.forEach(async (cluster) => {
      promise.push(
        openshiftDeletionCheck(profile.namespacePrefix, cluster.name)
      );
    });
    // project only lives on one cluster

    const deletionCheckResult: DeletableField[] = await Promise.all(promise);

    const isClusterDeletionStatusTheSame = deletionCheckResult.every(
      (clustersResult) =>
        Object.keys(clustersResult).every(
          (key) => clustersResult[key] === deletionCheckResult[0][key]
        )
    );

    if (deletionCheckResult.length === 1 || isClusterDeletionStatusTheSame) {
      await ProfileModel.setProjectDeletableStatus(
        profileId,
        deletionCheckResult.shift() || DEFAULT_DELETION_STATUS
      );
    } else {
      await ProfileModel.setProjectDeletableStatus(
        profileId,
        DEFAULT_DELETION_STATUS
      );
    }

    res.status(201).end();
  } catch (err) {
    const message = `Unable to send deletion check request.`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchDashboardProjectProfiles = async (
  { user }: { user: AuthenticatedUser },
  res: Response
): Promise<void> => {
  try {
    const results = await fetchAllDashboardProjects(user);

    res.status(200).json(results);
  } catch (err) {
    const message = "Unable fetch all project profiles";
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};
