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
import { ProjectProfile } from '../db/model/profile';
import { HumanAction } from '../db/model/request';
import { BodyType, Message, SendReceipt } from '../libs/service';
import shared from './shared';
import { transformContacts } from './utils';

export const enum MessageType {
  ProvisioningStarted = 0,
  ProvisioningCompleted,
  EditRequestStarted,
  EditRequestCompleted,
  RequestApproval,
  RequestRejected,
}

const dm = new DataManager(shared.pgPool);
const { ProfileModel, ContactModel, RequestModel} = dm;

const updateEmailContent = async (
    buff: string, profile: ProjectProfile, contactDetails: any, request: any, humanAction: any
  ): Promise<string> => {
  try {
    let emailContent: string;
    let humanActionComment: string = '';

    if (humanAction) {
      humanActionComment = (humanAction.comment !== null ? `Additional information: ${humanAction.comment}` : '');
    }

    const mapObj = {
      POName: contactDetails.POName,
      TCName: contactDetails.TCName,
      POEmail: contactDetails.POEmail,
      TCEmail: contactDetails.TCEmail,
      POGitHub: contactDetails.POGithubId,
      TCGitHub: contactDetails.TCGithubId,
      projectName: profile.name,
      projectDescription : profile.description,
      projectMinistry: profile.busOrgId,
      setCluster: profile.primaryClusterName,
      licensePlate: `${profile.namespacePrefix}`,
      requestType: ( request.editType ? 'Project Edit': 'New Project'),
      quotaSize: ( request.editType === 'quotaSize' ? request.editObject.quota : 'Small'),
      editType: ( request.editType === 'quotaSize' ? 'Quota' : ''),
      humanActionComment,
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
    const profile = await ProfileModel.findById(profileId);

    const reviewerEmails = config.get('reviewers:emails');
    const contacts = await ContactModel.findForProject(profileId);
    const contactDetails = await transformContacts(contacts)
    const to = (
      messageType === MessageType.RequestApproval ? reviewerEmails : [...new Set(contacts.map(c => c.email))]
      );
    const requests = await RequestModel.findForProfile(profileId);
    const request = requests.pop();
    if (!request) {
      return
    }

    const humanAction: HumanAction | undefined = await RequestModel.findHumanActionByRequestId(Number(request.id));

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
      case MessageType.EditRequestStarted:
        buff = fs.readFileSync(
          path.join(__dirname, '../../', 'templates/edit-request-received.html')
          ).toString();
        break;
      case MessageType.EditRequestCompleted:
        buff = fs.readFileSync(
          path.join(__dirname, '../../', 'templates/edit-request-done.html')
          ).toString();
        break;
      case MessageType.RequestApproval:
        buff = fs.readFileSync(
          path.join(__dirname, '../../', 'templates/request-approval.html')
          ).toString();
        break;
      case MessageType.RequestRejected:
        buff = fs.readFileSync(
          path.join(__dirname, '../../', 'templates/request-rejected.html')
          ).toString();
        break;
      default:
        logger.info('No message type given');
        return;
    }

    if (!buff) {
      return;
    }

    const bodyContent = await updateEmailContent(buff, profile, contactDetails, request, humanAction);

    if (!bodyContent) {
      return;
    }

    const message: Message = {
      bodyType: BodyType.HTML,
      body: bodyContent,
      to,
      from: 'Registry <PlatformServicesTeam@gov.bc.ca>',
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
