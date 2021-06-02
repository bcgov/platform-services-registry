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
import { CLUSTER_NAMES, GOLD_QUORUM_COUNT } from '../constants';
import DataManager from '../db';
import { ProjectProfile } from '../db/model/profile';
import { RequestEditType } from '../db/model/request';
import { AuthenticatedUser } from '../libs/authmware';
import { fetchBotMessageRequests } from '../libs/bot-message';
import { MessageType, sendProvisioningMessage } from '../libs/messaging';
import { getProvisionStatus, updateProvisionStatus } from '../libs/profile';
import { processProfileContactsEdit, processProfileQuotaSizeEdit, processProjectProfileEdit } from '../libs/request';
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
    }
    res.status(202).end();
  } catch (err) {
    const message = `Unable to provision namespaces for profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const provisionerCallbackHandler = async (
  { body }: { body: any }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { prefix, cluster } = body;

  try {
    const profile = await ProfileModel.findByPrefix(prefix);
    if (!profile) {
      throw new Error(`Cant find any profile for the given prefix ${prefix}`);
    }

    if (!CLUSTER_NAMES.includes(cluster)) {
      throw new Error(`Unknown cluster name: ${cluster} included in callback response`);
    }

    const isProfileProvisioned = await getProvisionStatus(profile);

    if (isProfileProvisioned) {
      await processProvisionedProfileEditRequest(profile, cluster);
    } else {
      await updateProvisionedProfile(profile, cluster);
    }
    res.status(204).end();
  } catch (err) {
    const message = `Unable to handle provisioner callback for profile prefix ${prefix}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

const updateProvisionedProfile = async (profile: ProjectProfile, clusterName: string): Promise<void> => {
  const { RequestModel } = dm;
  try {
    // Must check if all bot_messages are complete before completing.
    // Step 1. fetch active bot_messages for request

    const requests = await RequestModel.findForProfile(Number(profile.id));
    const request = requests.pop();
    if (!request) {
      return;
    }

    const botMessageSet = await fetchBotMessageRequests(Number(request.id))

    if (botMessageSet.length !== GOLD_QUORUM_COUNT) {
      await updateProvisionStatus(profile, true);

      await RequestModel.updateCompletionStatus(Number(request.id));

      logger.info(`Sending CHES message (${MessageType.ProvisioningCompleted}) for ${profile.id}`);
      await sendProvisioningMessage(Number(profile.id), MessageType.ProvisioningCompleted);
      logger.info(`CHES message sent for ${profile.id}`);
    }

    const botMessage = botMessageSet.filter(message => message.clusterName === clusterName).pop()
    if (!botMessage) {
      const errmsg = `Unable to get bot message with cluster name: ${clusterName}`;
      throw new Error(errmsg);
    }
    await RequestModel.updateCallbackStatus(Number(botMessage.id))

    return;
  } catch (err) {
    const message = `Unable to update provisioned profile`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

const processProvisionedProfileEditRequest = async (profile: ProjectProfile, clusterName: string): Promise<void> => {
  const { RequestModel } = dm;
  try {
    if (!profile.id) {
      throw new Error('Cant read the given profileId');
    }

    const requests = await RequestModel.findForProfile(profile.id);
    const request = requests.pop();
    if (!request) {
      return;
    }

    const botMessageSet = await fetchBotMessageRequests(Number(request.id))

    if (botMessageSet.length !== GOLD_QUORUM_COUNT) {
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
          throw new Error(`Invalid edit type for request ${request.id}`);
      }
      await RequestModel.updateCompletionStatus(Number(request.id));
    }

    const botMessage = botMessageSet.filter(message => message.clusterName === clusterName).pop()
    if (!botMessage) {
      const errmsg = `Unable to get bot message with cluster name: ${clusterName}`;
      throw new Error(errmsg);
    }
    await RequestModel.updateCallbackStatus(Number(botMessage.id))
  } catch (err) {
    const message = `Unable to process provisioned profile edit request`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};
