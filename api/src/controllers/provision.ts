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
import { fulfillNamespaceProvisioning } from '../libs/fulfillment';
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

export const updateProvisionedNamespaces = async (
  { body, params }: { body: any, params: any }, res: Response
): Promise<void> => {
  const { profileId } = params;
  const { NamespaceModel } = dm;

  try {
    const promises: any = [];
    body.forEach(namespace => {
      const { namespaceId, clusters } = namespace;
      clusters.forEach(cluster => {
        const { clusterId, provisioned } = cluster;
        console.log(namespaceId, clusterId, provisioned);
        promises.push(NamespaceModel.updateProvisionStatus(namespaceId, clusterId, provisioned));
      });
    });

    await Promise.all(promises);

    res.status(202).end();
  } catch (err) {
    const message = `Unable to update namespace status profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};
