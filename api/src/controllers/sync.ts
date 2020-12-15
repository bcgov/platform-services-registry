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
import DataManager from '../db';
import { ProjectProfile } from '../db/model/profile';
import { contextForProvisioning, FulfillmentContextAction } from '../libs/fulfillment';
import { getDefaultCluster, isNamespaceSetProvisioned } from '../libs/namespace-set';
import shared from '../libs/shared';

const dm = new DataManager(shared.pgPool);

export const getAllProvisionedProfileIds = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { ProfileModel, NamespaceModel } = dm;

  const provisionedProfileIds: number[] = [];
  try {
    const cluster = await getDefaultCluster();
    const profiles: ProjectProfile[] = await ProfileModel.findAll();

    for (const profile of profiles) {
      if (!profile.id) {
        const errmsg = `Cant retrieve profile ${profile.id}`;
        throw new Error(errmsg);
      }

      const namespaces = await NamespaceModel.findForProfile(profile.id);
      if (!namespaces || !cluster) {
        const errmsg = `Cant find any namespaces for the given profile ${profile.id}`;
        throw new Error(errmsg);
      }

      const result = await isNamespaceSetProvisioned(namespaces, cluster);
      if (result && profile.id) {
        provisionedProfileIds.push(profile.id);
      }
    }

    res.status(200).json(provisionedProfileIds);
  } catch (err) {
    const message = 'Unable fetch all provisioned profile ids';
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const getProvisionedProfileBotJson = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { profileId } = params;
  const { ProfileModel, NamespaceModel } = dm;

  try {
    const cluster = await getDefaultCluster();

    const profile = await ProfileModel.findById(Number(profileId));
    if (!profile) {
      const errmsg = `Cant find any profile for the given profile ${profileId}`;
      throw new Error(errmsg);
    }

    const namespaces = await NamespaceModel.findForProfile(profile.id);
    if (!namespaces || !cluster) {
      const errmsg = `Cant find any namespaces for the given profile ${profile.id}`;
      throw new Error(errmsg);
    }

    const result = await isNamespaceSetProvisioned(namespaces, cluster);
    if (!result) {
      const errmsg = `This profile ${profileId} is not provisioned`;
      throw new Error(errmsg);
    }

    const context = await contextForProvisioning(profileId, FulfillmentContextAction.Sync);
    res.status(200).json(context);
  } catch (err) {
    const message = `Unable get provisioned profile bot json for profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};
