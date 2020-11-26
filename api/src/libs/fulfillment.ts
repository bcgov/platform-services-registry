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
import { FULFILLMENT_CONTEXT, ROLE_IDS } from '../constants';
import DataManager from '../db';
import { Contact } from '../db/model/contact';
import { ProjectProfile } from '../db/model/profile';
import { Request } from '../db/model/request';
import { MessageType, sendProvisioningMessage } from './messaging';
import shared from './shared';

export interface Context {
  something: any;
}

export const contextForProvisioning = async (profileId: number): Promise<any> => {

  try {
    const dm = new DataManager(shared.pgPool);
    const { ProfileModel, ContactModel, NamespaceModel } = dm;
    const profile: ProjectProfile = await ProfileModel.findById(profileId);
    const contacts: Contact[] = await ContactModel.findForProject(profileId);
    const tcContact = contacts.filter(c => c.roleId === ROLE_IDS.TECHNICAL_CONTACT).pop();
    const poContact = contacts.filter(c => c.roleId === ROLE_IDS.PRODUCT_OWNER).pop();
    const namespaces = await NamespaceModel.findForProfile(profileId);

    if (!profile || !tcContact || !poContact || !namespaces) {
      logger.error('Unable to create context for provisioning');
      return; // This is a problem.
    }

    const context = {
      action: FULFILLMENT_CONTEXT.ACTIONS.CREATE,
      type: FULFILLMENT_CONTEXT.TYPES.STANDARD,
      profileId: profile.id,
      displayName: profile.name,
      description: profile.description,
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

export const fulfillNamespaceProvisioning = async (profileId: number) =>
  new Promise(async (resolve, reject) => {

    try {
      const nc = shared.nats;
      const subject = config.get('nats:subject');
      const context = await contextForProvisioning(profileId);

      if (!context) {
        const errmsg = `No context for ${profileId}`;
        reject(new Error(errmsg));
      }

      nc.on('error', () => {
        const errmsg = `NATS error sending order ${profileId} to ${subject}`;
        reject(new Error(errmsg));
      });

      logger.info(`Sending NATS message for ${profileId}`);
      nc.publish(subject, context);
      logger.info(`NATS Message sent for ${profileId}`);

      nc.flush(() => {
        nc.removeAllListeners(['error']);
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


export const fulfillNamespaceQuotaEdit = async (profileId: number, clusterNamespaceIds: number[], requestJson: any) =>
  new Promise(async (resolve, reject) => {

    try {
      const dm = new DataManager(shared.pgPool);
      const { RequestModel } = dm;
      const nc = shared.nats;

      const subject = config.get('nats:subject');

      const context = await contextForProvisioning(profileId);
      context.action = FULFILLMENT_CONTEXT.ACTIONS.EDIT;
      context.namespaces = requestJson;

      if (!context) {
        const errmsg = `No context for ${profileId}`;
        reject(new Error(errmsg));
      }

      nc.on('error', () => {
        const errmsg = `NATS error sending order ${profileId} to ${subject}`;
        reject(new Error(errmsg));
      });

      logger.info(`Sending NATS quota-edit message for ${profileId}`);
      nc.publish(subject, context);
      logger.info(`NATS quota-edit Message sent for ${profileId}`);

      nc.flush(() => {
        nc.removeAllListeners(['error']);
      });

      // TODO:(yf) writing requests to our db should not block
      // from this promise being resolved
      const promises: Promise<Request>[] = [];
      clusterNamespaceIds.forEach(cnId => {
        promises.push(
          RequestModel.create({
            clusterNamespaceId: cnId,
            natsSubject: subject,
            natsContext: JSON.stringify(context),
          })
        );
      });

      resolve();
    } catch (err) {
      const message = `Unable to provision namespaces quota edit`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  });
