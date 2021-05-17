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

import { logger } from '@bcgov/common-nodejs-utils';
import fs from 'fs';
import path from 'path';
import config from '../config';
import DataManager from '../db';
import { Contact } from '../db/model/contact';
import { ProjectProfile } from '../db/model/profile';
import { BodyType, Message, SendReceipt } from '../libs/service';
import shared from './shared';

export const enum MessageType {
  ProvisioningStarted = 0,
  ProvisioningCompleted,
  ProvisioningResponse,
}

const dm = new DataManager(shared.pgPool);
const { ProfileModel, ContactModel, RequestModel} = dm;

const contactsForProfile = async (profileId: number): Promise<Contact[]> => {
  try {
    return await ContactModel.findForProject(profileId);
  } catch (err) {
    const message = `Unable to fetch contacts for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    return [];
  }
}

const profileDetails = async (profileId: number): Promise<any> => {
  try {
    return await ProfileModel.findById(profileId);
  } catch (err) {
    const message = `Unable to fetch profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    return [];
  }
}

const requestDetails = async (profileId: number): Promise<any> => {
  try {
    return await RequestModel.findForProfile(profileId);
  } catch (err) {
    const message = `Unable to fetch request for ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    return [];
  }
}

const updateEmailContent = async (buff: string, to: string[], profile: ProjectProfile, contactNames: string[], requestType: string): Promise<string> => {
  try {
    let emailContent: string;

    const mapObj = {
      POName: contactNames[0],
      TCName: contactNames[1],
      POEmail: to[0],
      TCEmail: (typeof to[1] === 'undefined') ? to[0] : to[1],
      projectName: profile.name,
      setCluster: profile.primaryClusterName,
      licensePlate: `${profile.namespacePrefix}`,
      requestType: requestType,
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
    const reviewerEmails = config.get('reviewers:emails');
    const contacts = await contactsForProfile(profileId);
    const contactNames = contacts.map(c => c.firstName + ' ' + c.lastName);
    const to = (MessageType.ProvisioningResponse ? reviewerEmails : [...new Set(contacts.map(c => c.email))]);

    const profile = await profileDetails(profileId);

    const requests = await requestDetails(profileId);
    const request = requests.pop()
    const requestType = ( request.editType ? 'Project Edit': 'New Project')

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
      case MessageType.ProvisioningResponse:
        buff = fs.readFileSync(
          path.join(__dirname, '../../', 'templates/provisioning-request-response.html')
          ).toString();
        break;
      default:
        logger.info('No message type given');
        return;
    }

    if (!buff) {
      return;
    }

    const bodyContent = await updateEmailContent(buff, to, profile, contactNames, requestType);

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
