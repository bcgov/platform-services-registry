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

import { logger } from '@bcgov/common-nodejs-utils';
import config from '../config';
import { ROLE_IDS } from '../constants';
import DataManager from '../db';
import { Contact } from '../db/model/contact';
import { ProjectProfile } from '../db/model/profile';
import { Quotas, QuotaSize } from '../db/model/quota';
import { Request, RequestEditType, RequestType } from '../db/model/request';
import { replaceForDescription } from '../libs/utils';
import { NatsContext, NatsContextAction, NatsContextType, NatsMessage } from '../types';
import { createBotMessageSet, fetchBotMessageRequests } from './bot-message';
import { getQuotaSize } from './profile';
import shared from './shared';

const dm = new DataManager(shared.pgPool);
const { ProfileModel, ContactModel, QuotaModel, NamespaceModel } = dm;

export const fulfillRequest = async (request: Request):
  Promise<any> => {
    try {
      const profile: ProjectProfile = await ProfileModel.findById(request.profileId);
      const subjectPrefix: string = config.get('nats:subjectPrefix');

      const subject: string = subjectPrefix.concat(profile.primaryClusterName);
      const context: NatsContext = await generateContext(request);

      await createBotMessageSet(Number(request.id), subject, context)
      const botMessageSet = await fetchBotMessageRequests(Number(request.id))

      for (const botMessage of botMessageSet) {
        await sendNatsMessage(request.profileId, {
          natsSubject: botMessage.natsSubject,
          natsContext: botMessage.natsContext,
        })
      }
    } catch (err) {
      const message = `Unable to fulfill edit request for profile ${request.profileId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  };

// TODO: modify around isForSync so as to avoid passing bool directly
export const contextForProvisioning = async (profileId: number, isForSync: boolean): Promise<NatsContext> => {
  try {
    const action = isForSync ? NatsContextAction.Sync : NatsContextAction.Create;
    const profile: ProjectProfile = await ProfileModel.findById(profileId);
    const contacts: Contact[] = await ContactModel.findForProject(profileId);
    const quotaSize: QuotaSize = await getQuotaSize(profile);
    const quotas: Quotas = await QuotaModel.findForQuotaSize(quotaSize);

    return await buildContext(action, profile, contacts, quotaSize, quotas);
  } catch (err) {
    const message = `Unable to create context for provisioning ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export const contextForEditing = async (profileId: number, requestEditType: RequestEditType, requestEditObject: any): Promise<NatsContext> => {
  try {
    const action = NatsContextAction.Edit;
    let profile: ProjectProfile;
    let quotaSize: QuotaSize;
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

    if (requestEditType === RequestEditType.Contacts) {
      contacts = JSON.parse(requestEditObject);
    } else {
      contacts = await ContactModel.findForProject(profileId);
    }
    return await buildContext(action, profile, contacts, quotaSize, quotas);
  } catch (err) {
    const message = `Unable to create context for updating ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

const generateContext = async (request: Request): Promise<NatsContext> => {

  switch (request.type) {
    case RequestType.Create:
      return await contextForProvisioning(request.profileId, false);
    case RequestType.Edit:
      if (!request.editType){
        throw new Error(`Invalid edit type for request ${request.id}`)
      }
      return await contextForEditing(request.profileId, false, request.editType, request.editObject);
    default:
      throw new Error(`Invalid type for request ${request.id}`);
  }
}

const buildContext = async (
  action: NatsContextAction, profile: ProjectProfile, contacts: Contact[], quotaSize: QuotaSize, quotas: Quotas
): Promise<NatsContext> => {
  try {
    if (!profile.id) {
      throw new Error('Cant get profile id');
    }
    const namespaces = await NamespaceModel.findForProfile(profile.id);
    const tcContact = contacts.filter(contact => contact.roleId === ROLE_IDS.TECHNICAL_CONTACT).pop();
    const poContact = contacts.filter(contact => contact.roleId === ROLE_IDS.PRODUCT_OWNER).pop();

    if (!profile || !tcContact || !poContact || !quotaSize || !quotas || !namespaces) {
      throw new Error('Missing arguments to build nats context');
    }

    return {
      action,
      type: NatsContextType.Standard,
      profileId: profile.id,
      displayName: profile.name,
      newDisplayName: 'NULL',
      description: profile.description,
      quota: quotaSize,
      quotas,
      namespaces,
      technicalContact: {
        userId: tcContact.githubId,
        provider: 'github', // TODO:(JL) Fix as part of #94.
        email: tcContact.email,
      },
      productOwner: {
        userId: poContact.githubId,
        provider: 'github', // TODO:(JL) Fix as part of #94.
        email: poContact.email,
      },
    };
  } catch (err) {
    const message = `Unable to build context for profile ${profile.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

const sendNatsMessage = async (profileId: number, natsMessage: NatsMessage): Promise<NatsMessage> => {
  try {
    const nc = shared.nats;
    const { natsSubject, natsContext } = natsMessage;
    nc.on('error', () => {
      const errmsg = `NATS error sending order ${profileId} to ${natsSubject}`;
      throw new Error(errmsg);
    });

    logger.info(`Sending NATS message for ${profileId} to ${natsSubject}`);

    nc.publish(natsSubject, replaceForDescription(natsContext));
    logger.info(`NATS Message sent for ${profileId} to ${natsSubject}`);

    nc.flush(() => {
      nc.removeAllListeners(['error']);
    });

    return natsMessage;
  } catch (err) {
    const message = `Unable to send nats message for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};
