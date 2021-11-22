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
import { PROFILE_STATUS } from "../constants";
import DataManager from "../db";
import { Contact } from "../db/model/contact";
import { ProjectProfile } from "../db/model/profile";
import { ProjectQuotaSize } from "../db/model/quota";
import { Request, RequestEditType, RequestType } from "../db/model/request";
import { comparerContact } from "../db/utils";
import { AuthenticatedUser } from "./authmware";
import { MessageType, sendProvisioningMessage } from "./messaging";
import { updateProfileStatus } from "./profile";
import shared from "./shared";

const dm = new DataManager(shared.pgPool);
const { RequestModel, QuotaModel, NamespaceModel } = dm;

const createRequest = async (
  type: RequestType,
  userId: number,
  requiresHumanAction: boolean,
  profileId: number,
  editType?: RequestEditType,
  editObject?: any
): Promise<Request> => {
  try {
    const existingRequests = await RequestModel.findForProfile(profileId);
    if (existingRequests.length > 0) {
      throw new Error("Cant proceed as the profile has existing request");
    }

    switch (type) {
      case RequestType.Create:
        await updateProfileStatus(
          Number(profileId),
          PROFILE_STATUS.PENDING_APPROVAL
        );
        break;
      case RequestType.Edit:
        await updateProfileStatus(
          Number(profileId),
          PROFILE_STATUS.PENDING_EDIT
        );
        break;
      // no default
    }

    return await RequestModel.create({
      profileId,
      editType,
      editObject,
      type,
      requiresHumanAction,
      isActive: true,
      userId,
    });
  } catch (err) {
    const message = `Unable to process request edit`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const requestProjectProfileCreate = async (
  profileId: number,
  user: AuthenticatedUser,
  requiresHumanAction: boolean
): Promise<Request> => {
  try {
    const request = await createRequest(
      RequestType.Create,
      user.id,
      requiresHumanAction,
      profileId
    );

    logger.info(
      `Sending CHES message (${MessageType.ProvisioningStarted}) for ${profileId}`
    );
    await sendProvisioningMessage(profileId, MessageType.ProvisioningStarted);
    await sendProvisioningMessage(profileId, MessageType.RequestApproval);
    logger.info(`CHES message sent for ${profileId}`);

    return request;
  } catch (err) {
    const message = `Unable to create request for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const requestProjectProfileEdit = async (
  profileId: number,
  newProjectProfile: ProjectProfile,
  user: AuthenticatedUser,
  requiresHumanAction: boolean = false
): Promise<Request> => {
  try {
    const editObject = newProjectProfile;
    return await createRequest(
      RequestType.Edit,
      user.id,
      requiresHumanAction,
      profileId,
      RequestEditType.ProjectProfile,
      editObject
    );
  } catch (err) {
    const message = `Unable to request project-profile edit for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const processProjectProfileEdit = async (
  request: Request
): Promise<void> => {
  const { ProfileModel } = dm;
  try {
    const newProjectProfile = request.editObject;

    if (!newProjectProfile) {
      return;
    }

    await ProfileModel.update(newProjectProfile.id, newProjectProfile);
  } catch (err) {
    const message = `Unable to process project-profile edit for request ${request.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const requestProfileContactsEdit = async (
  profileId: number,
  newContacts: Contact[],
  user: AuthenticatedUser,
  requiresHumanAction: boolean = false
): Promise<Request> => {
  try {
    const editObject = newContacts;

    return await createRequest(
      RequestType.Edit,
      user.id,
      requiresHumanAction,
      profileId,
      RequestEditType.Contacts,
      editObject
    );
  } catch (err) {
    const message = `Unable to request contacts edit for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const requestProfileContactRemove = async (
  profileId: number,
  newContacts: Contact[],
  user: AuthenticatedUser,
  requiresHumanAction: boolean = false
): Promise<Request> => {
  try {
    const editObject = newContacts;

    return await createRequest(
      RequestType.Edit,
      user.id,
      requiresHumanAction,
      profileId,
      RequestEditType.Contacts,
      editObject
    );
  } catch (err) {
    const message = `Unable to request contacts edit for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const processProfileContactsEdit = async (
  request: Request
): Promise<void> => {
  const { ProfileModel, ContactModel } = dm;

  try {
    const currentContacts: Contact[] = await ContactModel.findForProject(
      Number(request.profileId)
    );

    const contacts: Contact[] = request.editObject;

    for (const contact of contacts) {
      const currentContact = currentContacts
        .filter((cc) => cc.id === contact.id)
        .pop();
      if (currentContact) {
        await ContactModel.update(Number(contact.id), contact);
      } else {
        const newContact = await ContactModel.create(contact);
        await ProfileModel.addContactToProfile(
          Number(request.profileId),
          Number(newContact.id)
        );
      }
    }

    // functionality to delete a contact if a project goes from 2 TL's -> 1 TL.
    const removeExistingContact = currentContacts.filter(
      comparerContact(contacts, "id")
    );

    // remove contact if request's contacts number is less than what we have in db
    removeExistingContact.forEach(async (contact) => {
      const removeExistingContactID = contact.id;
      await ProfileModel.removeContactFromProfile(
        Number(request.profileId),
        Number(removeExistingContactID)
      );
      await ContactModel.delete(Number(removeExistingContactID));
    });

    return;
  } catch (err) {
    const message = `Unable to process profile contacts edit for request ${request.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const requestProfileQuotaSizeEdit = async (
  profileId: number,
  requestedQuotaSize: ProjectQuotaSize,
  user: AuthenticatedUser,
  requiresHumanAction: boolean = false,
  namespace: string
): Promise<Request> => {
  try {
    const requestType = RequestType.Edit;
    const editType = RequestEditType.QuotaSize;
    const editObject = {
      namespace,
      quota: requestedQuotaSize,
      quotas: await QuotaModel.findForQuotaSize(requestedQuotaSize),
    };

    const request = await createRequest(
      requestType,
      user.id,
      requiresHumanAction,
      profileId,
      editType,
      editObject
    );

    logger.info(
      `Sending CHES message Project Edit Notification for ${profileId}`
    );
    await sendProvisioningMessage(profileId, MessageType.EditRequestStarted);
    await sendProvisioningMessage(profileId, MessageType.RequestApproval);
    logger.info(`CHES message sent for ${profileId}`);

    return request;
  } catch (err) {
    const message = `Unable to request quota-size edit for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const processProfileQuotaSizeEdit = async (
  request: Request
): Promise<void> => {
  try {
    const { profileId, editObject } = request;
    const { quota, namespace } = editObject;

    await NamespaceModel.updateNamespaceQuotaSize(profileId, quota, namespace);

    logger.info(`Sending CHES message Project Edit Success for ${profileId}`);
    await sendProvisioningMessage(profileId, MessageType.EditRequestCompleted);
    logger.info(`CHES message sent for ${profileId}`);
  } catch (err) {
    const message = `Unable to process quota-size edit for request ${request.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};
