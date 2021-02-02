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
// Created by Jason Leach on 2020-04-27.
//

'use strict';

import { errorWithCode, logger } from '@bcgov/common-nodejs-utils';
import { Response } from 'express';
import DataManager from '../db';
import { ProjectProfile } from '../db/model/profile';
import { RequestEditType } from '../db/model/request';
import { fulfillNamespaceProvisioning } from '../libs/fulfillment';
import { MessageType, sendProvisioningMessage } from '../libs/messaging';
import { isProfileProvisioned } from '../libs/primary-namespace-set';
import { processProfileNamespacesEditType } from '../libs/quota-editing';
import shared from '../libs/shared';
import { processContactEdit } from './contact';
import { processProfileEdit } from './profile';

const dm = new DataManager(shared.pgPool);

export const provisionProfileNamespaces = async (
  { params }: { params: any }, res: Response
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

      // @ts-expect-error
      await NamespaceModel.createProjectSet(profileId, cluster.id, profile.namespacePrefix);
    }

    await fulfillNamespaceProvisioning(profileId);

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
  const { prefix } = body;
  try {
    const profile = await ProfileModel.findByPrefix(prefix);
    if (!profile) {
      const errmsg = `Cant find any profile for the given prefix ${prefix}`;
      throw new Error(errmsg);
    }

    const result = await isProfileProvisioned(profile);
    if (result) {
      await updateProfileEdit(profile);
      res.status(202).end();
    } else {
      await updateProvisionedNamespaces(profile);
      res.status(202).end();
    }
  } catch (err) {
    const message = `Unable to update status for profile prefix ${prefix}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

const updateProvisionedNamespaces = async (profile: ProjectProfile): Promise<void> => {
  const { NamespaceModel } = dm;

  try {
    const namespaces = await NamespaceModel.findForProfile(Number(profile.id))
    if (!namespaces) {
      throw new Error();
    }

    const provisioned = true;
    const promises: any = [];

    namespaces.forEach(namespace => {
      // @ts-ignore
      const { namespaceId, clusters } = namespace;
      clusters?.forEach(cluster => {
        // @ts-ignore
        const { clusterId } = cluster;
        promises.push(NamespaceModel.updateProvisionStatus(namespaceId, clusterId, provisioned));
      });
    });

    await Promise.all(promises);

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

const updateProfileEdit = async (profile: ProjectProfile): Promise<void> => {
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
    // check request type and process accordingly
    switch (request.editType) {
      case RequestEditType.Namespaces:
        await processProfileNamespacesEditType(request);
        break;
      case RequestEditType.Contacts:
        await processContactEdit(request);
        break;
      case RequestEditType.Description:
        await processProfileEdit(request);
        break;
      default:
        const errmsg = `Invalid edit type for request ${request.id}`;
        throw new Error(errmsg);
    }
    await RequestModel.delete(Number(request.id));
  } catch (err) {
    const message = `Unable to update profile edit`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};


