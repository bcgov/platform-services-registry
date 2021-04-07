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
import { RequestEditType } from '../db/model/request';
import { replaceForDescription } from '../libs/utils';
import { NatsContext, NatsContextAction, NatsContextType, NatsMessage } from '../types';
import { MessageType, sendProvisioningMessage } from './messaging';
import { getQuotaSize } from './profile';
import shared from './shared';

const dm = new DataManager(shared.pgPool);

export const fulfillNamespaceProvisioning = async (profileId: number) =>
  new Promise(async (resolve, reject) => {
    try {
      const context = await contextForProvisioning(profileId, false);
      const subject = config.get('nats:subject');

      await sendNatsMessage(profileId, {
        natsSubject: subject,
        natsContext: context,
      });

      logger.info(`Sending CHES message (${MessageType.ProvisioningStarted}) for ${profileId}`);
      await sendProvisioningMessage(profileId, MessageType.ProvisioningStarted);
      logger.info(`CHES message sent for ${profileId}`);

      resolve();
    } catch (err) {
      const message = `Unable to fulfill namespace provisioning for profile ${profileId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  });

export const fulfillEditRequest = async (profileId: number, requestEditType: RequestEditType, requestEditObject: any): Promise<NatsMessage> =>
  new Promise(async (resolve, reject) => {
    try {
      const context = await contextForEditing(profileId, false, requestEditType, requestEditObject);
      const subject = config.get('nats:subject');

      const natsMessage = await sendNatsMessage(profileId, {
        natsSubject: subject,
        natsContext: context,
      });

      resolve(natsMessage);
    } catch (err) {
      const message = `Unable to fulfill namespace provisioning for profile ${profileId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  });

export const contextForProvisioning = async (profileId: number, isForSync: boolean): Promise<NatsContext> => {
  try {
    const { ProfileModel, ContactModel, QuotaModel } = dm;

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

export const contextForEditing = async (profileId: number, isForSync: boolean, requestEditType: RequestEditType, requestEditObject: any): Promise<NatsContext> => {
  try {
    const { ProfileModel, ContactModel, QuotaModel } = dm;

    const action = isForSync ? NatsContextAction.Sync : NatsContextAction.Edit;
    let profile: ProjectProfile;
    let quotaSize: QuotaSize;
    let quotas: Quotas;
    let contacts: Contact[];

    if (requestEditType === RequestEditType.ProjectProfile) {
      profile = requestEditObject;
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
      contacts = requestEditObject;
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

const buildContext = async (
  action: NatsContextAction, profile: ProjectProfile, contacts: Contact[], quotaSize: QuotaSize, quotas: Quotas
): Promise<NatsContext> => {
  const { NamespaceModel } = dm;
  try {
    if (!profile.id) {
      throw new Error('Cant get profile id');
    }
    const namespaces = await NamespaceModel.findForProfile(profile.id);

    const tcContact = contacts.filter(c => c.roleId === ROLE_IDS.TECHNICAL_CONTACT).pop();
    const poContact = contacts.filter(c => c.roleId === ROLE_IDS.PRODUCT_OWNER).pop();

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

    logger.info(`Sending NATS message for ${profileId}`);

    nc.publish(natsSubject, replaceForDescription(natsContext));
    logger.info(`NATS Message sent for ${profileId}`);

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
<<<<<<< HEAD
=======

export const fulfillNamespaceProvisioning = async (profileId: number) =>
  new Promise(async (resolve, reject) => {
    try {
      const subject = config.get('nats:subject');
      const context = await contextForProvisioning(profileId, FulfillmentContextAction.Create);

      if (!context) {
        const errmsg = `No context for ${profileId}`;
        reject(new Error(errmsg));
      }

      await sendNatsMessage(profileId, {
        natsSubject: subject,
        natsContext: context,
      });

      logger.info(`Sending CHES message (${MessageType.ProvisioningStarted}) for ${profileId}`);
      await sendProvisioningMessage(profileId, MessageType.ProvisioningStarted);
      logger.info(`CHES message sent for ${profileId}`);

      resolve();
    } catch (err) {
      const message = `Unable to provision namespaces for profile ${profileId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  });

export const fulfillEditRequest = async (profileId: number, requestType: RequestEditType, requestEditObject: any): Promise<NatsObject> =>
  new Promise(async (resolve, reject) => {
    try {
      const subject = config.get('nats:subject');
      const context = await contextForProvisioning(profileId, FulfillmentContextAction.Edit);

      if (!context) {
        const errmsg = `No context for ${profileId}`;
        reject(new Error(errmsg));
      }

      switch (requestType) {
        case RequestEditType.QuotaSize:
          context.quota = requestEditObject.quota;
          context.quotas = requestEditObject.quotas;
          break;
        case RequestEditType.Contacts:
          Object.values(RequestEditContacts).forEach(contact => {
            context[contact] = requestEditObject[contact];
          });
          break;
        case RequestEditType.ProjectProfile:
          context.description = requestEditObject.description;
          break;
        default:
          const errmsg = `Invalid edit type for request ${requestType}`;
          throw new Error(errmsg);
      }

      const natsObject = await sendNatsMessage(profileId, {
        natsSubject: subject,
        natsContext: context,
      });

      // TODO:(yh) add sending ches message here
      resolve(natsObject);
    } catch (err) {
      const message = `Unable to update namespaces for profile ${profileId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  });
>>>>>>> 5fc9710 (refactor and modify unit tests)
