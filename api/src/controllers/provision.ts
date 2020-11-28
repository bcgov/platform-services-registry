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
import { ClusterNamespace, ProjectNamespace } from '../db/model/namespace';
import { ProjectProfile } from '../db/model/profile';
import { fulfillNamespaceProvisioning, RequestEditType } from '../libs/fulfillment';
import { MessageType, sendProvisioningMessage } from '../libs/messaging';
import { getDefaultCluster, processNamespacesEditType } from '../libs/quota-editing';
import shared from '../libs/shared';


const dm = new DataManager(shared.pgPool);

export const provisionProfileNamespaces = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { profileId } = params;
  const { ProfileModel, NamespaceModel, ClusterModel } = dm;

  try {
    const existing = await NamespaceModel.findForProfile(profileId);
    if (existing.length === 0) {
      const clusters = await ClusterModel.findAll();
      // TODO:(jl) Everything goes to the default cluster for now.
      const clusterId = clusters.filter(c => c.isDefault === true).pop().id;
      const profile = await ProfileModel.findById(profileId);

      if (!clusterId || !profile) {
        errorWithCode(500, 'Unable to fetch info for provisioning');
      }

      await NamespaceModel.createProjectSet(profileId, clusterId, profile.namespacePrefix);
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
  const { NamespaceModel, ProfileModel } = dm;
  const { prefix } = body;
  try {
    const profile = await ProfileModel.findByPrefix(prefix);
    if (!profile) {
      throw new Error(`Cant find any profile for the given prefix ${prefix}`);
    }
    const namespaces = await NamespaceModel.findForProfile(Number(profile.id))
    if (!namespaces) {
      throw new Error(`Cant find any namespaces for the given prefix ${prefix}`);
    }

    const defaultCluster = await getDefaultCluster();
    const promises: Promise<ClusterNamespace>[] = [];
    namespaces.forEach(namespace => {
      // @ts-ignore
      promises.push(NamespaceModel.findForNamespaceAndCluster(namespace.namespaceId, defaultCluster.id));
    });
    const clusterNamespaces = await Promise.all(promises);

    const flags: boolean[] = clusterNamespaces.map((clusterNamespace: ClusterNamespace): boolean => {
      return clusterNamespace.provisioned;
    });
    if (flags.every(f => f === true)) {
      await updateNamespacesEdit(profile);
      res.status(202).end();
    } else if (flags.every(f => f === false)) {
      await updateProvisionedNamespaces(namespaces, profile);
      res.status(202).end();
    } else {
      throw new Error(`Need to fix project namespace set under profile ID ${profile.id}`);
    }
  } catch (err) {
    const message = `Unable to update namespace status`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

const updateProvisionedNamespaces = async (namespaces: ProjectNamespace[], profile: ProjectProfile): Promise<void> => {
  const { NamespaceModel } = dm;

  try {
    const provisioned = true;
    const promises: any = [];

    namespaces.forEach(namespace => {
      // @ts-ignore
      const { namespaceId, clusters } = namespace;
      // @ts-ignore
      clusters.forEach(cluster => {
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

    throw errorWithCode(message, 500);
  }
};

const updateNamespacesEdit = async (profile: ProjectProfile): Promise<void> => {
  const { RequestModel } = dm;

  try {
    if (!profile.id) {
      throw new Error('Cant read the given profileId');
    }
    const requests = await RequestModel.findForProfile(profile.id);

    if (requests.length === 0) {
      return;
    }

    const request = requests[0];
    if (request.editType === RequestEditType.Namespaces) {
      await processNamespacesEditType(request);
      await RequestModel.delete(Number(request.id));
      return;
    }
  } catch (err) {
    const message = `Unable to update namespace quota`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};
