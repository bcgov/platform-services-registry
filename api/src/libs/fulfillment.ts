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
// Created by Jason Leach on 2020-06-2.
//

import { logger } from '@bcgov/common-nodejs-utils';
import config from '../config';
import { ROLE_IDS } from '../constants';
import DataManager from '../db';
import { Contact } from '../db/model/contact';
import { ProjectProfile } from '../db/model/profile';
import { Quotas, QuotaSize } from '../db/model/quota';
import { RequestEditContacts, RequestEditType } from '../db/model/request';
import { getCurrentQuotaSize } from '../libs/primary-namespace-set';
import { replaceForDescription } from '../libs/utils';
import { MessageType, sendProvisioningMessage } from './messaging';
import shared from './shared';

export interface Context {
  something: any;
}

export const enum FulfillmentContextAction {
  Create = 'create',
  Edit = 'edit',
  Sync = 'sync',
};

const enum FulfillmentContextType {
  Standard = 'standard',
};

interface NatsObject {
  natsSubject: string,
  natsContext: any,
}

export const contextForProvisioning = async (profileId: number, action: FulfillmentContextAction): Promise<any> => {
  try {
    const dm = new DataManager(shared.pgPool);
    const { ProfileModel, ContactModel, NamespaceModel, QuotaModel } = dm;

    const profile: ProjectProfile = await ProfileModel.findById(profileId);
    const contacts: Contact[] = await ContactModel.findForProject(profileId);
    const tcContact = contacts.filter(c => c.roleId === ROLE_IDS.TECHNICAL_CONTACT).pop();
    const poContact = contacts.filter(c => c.roleId === ROLE_IDS.PRODUCT_OWNER).pop();
    const quotaSize: QuotaSize = await getCurrentQuotaSize(profile);
    const quotas: Quotas = await QuotaModel.findForQuotaSize(quotaSize);
    const namespaces = await NamespaceModel.findForProfile(profileId);

    if (!profile || !tcContact || !poContact || !quotaSize || !quotas || !namespaces) {
      logger.error('Unable to create context for provisioning');
      return; // This is a problem.
    }

    const context = {
      action,
      type: FulfillmentContextType.Standard,
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

    return context;
  } catch (err) {
    const message = `Unable to build context for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

const sendNatsMessage = async (profileId: number, natsObject: NatsObject): Promise<NatsObject> => {
  try {
    const nc = shared.nats;
    const { natsSubject, natsContext } = natsObject;

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

    return natsObject;
  } catch (err) {
    const message = `Unable to send nats message for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

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
        case RequestEditType.Description:
          context[requestType] = requestEditObject;
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
