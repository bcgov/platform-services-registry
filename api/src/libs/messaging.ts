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
// Created by Jason Leach on 2020-09-09.
//

import { logger } from '@bcgov/common-nodejs-utils';
import fs from 'fs';
import path from 'path';
import DataManager from '../db';
import { Contact } from '../db/model/contact';
import { BodyType, Message, SendReceipt } from '../libs/service';
import shared from './shared';

export const enum MessageType {
  ProvisioningStarted = 0,
  ProvisioningCompleted,
}

export const contactsForProfile = async (profileId: number): Promise<Contact[]> => {

  try {
    const dm = new DataManager(shared.pgPool);
    const { ContactModel } = dm;

    return await ContactModel.findForProject(profileId);
  } catch (err) {
    const message = `Unable to fetch contacts for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    return [];
  }
}

export const profileDetails = async (profileId: number): Promise<any> => {

  try {
    const dm = new DataManager(shared.pgPool);
    const { ProfileModel } = dm;
    return await ProfileModel.findById(profileId);
  } catch (err) {
    const message = `Unable to fetch profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    return [];
  }
}

export const updateEmailContent = async (buff: string, to: string[], profile: any, contactNames: string[]): Promise<string> => {
  try {
    let emailContent: string;

    const mapObj = {
      POName: contactNames[0],
      TCName: contactNames[1],
      POEmail: to[0],
      TCEmail: (typeof to[1] === 'undefined') ? to[0] : to[1],
      projectName: profile.name,
      // TODO (sb): Make dynamic when multicluster supported
      setCluster: 'Silver',
      licensePlate: `${profile.namespacePrefix}`,
    };

    const re = new RegExp(Object.keys(mapObj).join('|'),'gi');
    emailContent = buff.replace(re, matched => {
      return mapObj[matched];
    });
    return emailContent;
  } catch (err) {
    const message = `Unable to update email content`;
    logger.error(`${message}, err = ${err.message}`);

    return '';
  }

}

export const sendProvisioningMessage = async (profileId: number, messageType: MessageType): Promise<SendReceipt | undefined> => {

  try {
    const contacts = await contactsForProfile(profileId);
    const contactNames = contacts.map(c => c.firstName + ' ' + c.lastName);
    const to = [...new Set(contacts.map(c => c.email))];
    const profile = await profileDetails(profileId);
    let buff;

    if (to.length === 0) {
      return;
    }

    switch (messageType) {
      case MessageType.ProvisioningStarted:
        buff = fs.readFileSync(
          path.join(__dirname, '../../', 'templates/provisioning-request-received.html')
          ).toString();
        break;
      case MessageType.ProvisioningCompleted:
        buff = fs.readFileSync(
          path.join(__dirname, '../../', 'templates/provisioning-request-done.html')
          ).toString();
        break;
      default:
        logger.info('No message type given');
        return;
    }

    if (!buff) {
      return;
    }

    const bodyContent = await updateEmailContent(buff, to, profile, contactNames);

    if (!bodyContent) {
      return;
    }

    const message: Message = {
      bodyType: BodyType.HTML,
      body: bodyContent,
      to,
      from: 'Registry <pathfinder@gov.bc.ca>',
      subject: `${profile.name} OCP 4 Project Set`,
    }

    const receipt = await shared.ches.send(message);
    logger.info(`Message (${messageType}) sent with transaction details: ${JSON.stringify(receipt)}`);

    return receipt;
  } catch (err) {
    const message = `Unable to send message for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    return;
  }
}
