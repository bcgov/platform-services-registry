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


'use strict';

import { errorWithCode, logger } from '@bcgov/common-nodejs-utils';
import { Response } from 'express';
import DataManager from '../db';
import { Contact } from '../db/model/contact';
import { ProjectProfile } from '../db/model/profile';
import { Request, RequestEditType } from '../db/model/request';
import { AuthenticatedUser } from '../libs/authmware';
import { MessageType, sendProvisioningMessage } from '../libs/messaging';
import { applyProfileRequestedQuotaSize, isProfileProvisioned, updateProvisionedProfile } from '../libs/profile';
import { requestProjectProfileCreate } from '../libs/request';
import shared from '../libs/shared';

const dm = new DataManager(shared.pgPool);

export const provisionProfileNamespaces = async (
  { params, user }: { params: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { profileId } = params;
  const { ProfileModel, NamespaceModel, ClusterModel } = dm;

  try {
    const existing = await NamespaceModel.findForProfile(profileId);
    if (existing.length === 0) {
      const profile = await ProfileModel.findById(profileId);
      const cluster = await ClusterModel.findByName(profile.primaryClusterName);

      if (!profile || !cluster) {
        const errmsg = 'Unable to fetch info for provisioning';
        throw new Error(errmsg);
      }

      await NamespaceModel.createProjectSet(profileId, Number(cluster.id), profile.namespacePrefix);

      const requiresHumanAction = true;
      await requestProjectProfileCreate(Number(profile.id), user, requiresHumanAction);
    }


    logger.info(`Sending CHES message (${MessageType.ProvisioningStarted}) for ${profileId}`);
    await sendProvisioningMessage(profileId, MessageType.ProvisioningStarted);
    logger.info(`CHES message sent for ${profileId}`);

    res.status(202).end();
  } catch (err) {
    const message = `Unable fetch namespace for profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const provisionCallbackHandler = async (
  { body }: { body: any }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { prefix, clusterName } = body;

  try {
    const profile = await ProfileModel.findByPrefix(prefix);
    if (!profile) {
      const errmsg = `Cant find any profile for the given prefix ${prefix}`;
      throw new Error(errmsg);
    }

    const result = await isProfileProvisioned(profile);
    if (result) {
      await updateProfileEdit(profile, clusterName);
    } else {
      await updateProvisionedNamespaces(profile);
    }
    res.status(202).end();
  } catch (err) {
    const message = `Unable to update status for profile prefix ${prefix}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

const updateProvisionedNamespaces = async (profile: ProjectProfile): Promise<void> => {
  const { RequestModel } = dm
  try {
    await updateProvisionedProfile(profile);
    // TODO (yh note): We could perhaps have a util function that checks the query params validation 
    // (besides the existing one that checks for POST body structure based on Model required types) 
    // and serve 400 bad request consistently
    if (!profile.id){
    throw new Error('Cant read the given profileId');
    }

    const requests = await RequestModel.findForProfile(profile.id);
    const request = requests.pop();
    if (!request) {
      return;
    }

    await RequestModel.isComplete(Number(request.id));
    // TODO:(jl) This is a catch all endpoint. Needs to be more specific to
    // be used for emailing.
    logger.info(`Sending CHES message (${MessageType.ProvisioningCompleted}) for ${profile.id}`);
    await sendProvisioningMessage(Number(profile.id), MessageType.ProvisioningCompleted);
    logger.info(`CHES message sent for ${profile.id}`);
    return;
  } catch (err) {
    const message = `Unable to update namespace status`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

const updateProfileEdit = async (profile: ProjectProfile, clusterName: string): Promise<void> => {
  const { RequestModel } = dm;

  try {
    if (!profile.id) {
      throw new Error('Cannot read the given profileId');
    }

    const requests = await RequestModel.findForProfile(profile.id);
    const request = requests.pop();
    if (!request) {
      return;
    }

    console.log(clusterName)

    //const completedBotMessages = await processBotMessage(request, clusterName)

    //TODO: process this logic for each bot_message
    //console.log(completedBotMessages)

    switch (request.editType) {
      case RequestEditType.ProjectProfile:
        await processProjectProfileEdit(request);
        break;
      case RequestEditType.Contacts:
        await processProfileContactsEdit(request);
        break;
      case RequestEditType.QuotaSize:
        await processProfileQuotaSizeEdit(request);
        break;
      default:
        const errmsg = `Invalid edit type for request ${request.id}`;
        throw new Error(errmsg);
    }
    await RequestModel.isComplete(Number(request.id));
  } catch (err) {
    const message = `Unable to update profile edit for profile ${profile.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

const processProjectProfileEdit = async (request: Request): Promise<void> => {
  const { ProfileModel } = dm;

  try {
    const { profileId, editObject } = request;

    if (!editObject){
      throw new Error('Cannot read the given editObject');
    }

    const profile = JSON.parse(editObject);

    await ProfileModel.update(Number(profileId), profile);
  } catch (err) {
    const message = `Unable to process requestId ${request.id} on bot callback`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const processProfileContactsEdit = async (request: Request): Promise<void> => {
  const { ContactModel } = dm;

  try {
    const { editObject } = request;
    
    if (!editObject){
      throw new Error('Cannot read the given editObject');
    }
    
    const contacts = JSON.parse(editObject);

    const updatePromises: any = [];
    contacts.forEach((contact: Contact) => {
      updatePromises.push(ContactModel.update(Number(contact.id), contact));
    });

    await Promise.all(updatePromises);
  } catch (err) {
    const message = `Unable to process requestId ${request.id} on bot callback`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

const processProfileQuotaSizeEdit = async (request: Request): Promise<void> => {
  const { ProfileModel } = dm;
  try {
    const { profileId, editObject } = request;

    if (!editObject){
      throw new Error('Cannot read the given editObject');
    }
    
    const { quota } = JSON.parse(editObject);
    const profile = await ProfileModel.findById(profileId);

    await applyProfileRequestedQuotaSize(profile, quota);
  } catch (err) {
    const message = `Unable to process requestId ${request.id} on bot callback`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

// const processBotMessage = async (request: Request, clusterName: string): Promise<void> => {
//   const { RequestModel } = dm;

//   if (!request.id) {
//     return;
//   }

//   // Check for active bot_messages
//   const botMessages = await RequestModel.findForRequest(request.id)


//   const updatePromises: any = [];
//   botMessages.forEach((botMessage: BotMessage) => {
//     switch (botMessage.clusterName) {
//       case clusterName:
//         updatePromises.push(RequestModel.updateCallbackStatus(Number(botMessage.id)));
//         break;
//       default:
//         break;
//     }
//   });

//   await Promise.all(updatePromises);



// }
