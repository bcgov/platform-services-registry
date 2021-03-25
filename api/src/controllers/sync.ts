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
import { Request } from '../db/model/request';
import { contextForEditing, contextForProvisioning } from '../libs/fulfillment';
import { getProvisionStatus } from '../libs/profile';
import shared from '../libs/shared';
import { replaceForDescription } from '../libs/utils';

const dm = new DataManager(shared.pgPool);

export const getAllProvisionedProfileIds = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;

  const provisionedProfileIds: number[] = [];
  try {
    const profiles: ProjectProfile[] = await ProfileModel.findAll();

    for (const profile of profiles) {
      const result = await getProvisionStatus(profile);
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
  const { ProfileModel } = dm;

  try {
    const profile = await ProfileModel.findById(Number(profileId));
    if (!profile) {
      const errmsg = `Cant find any profile for the given profile ${profileId}`;
      throw new Error(errmsg);
    }

    const result = await getProvisionStatus(profile);
    if (!result) {
      const errmsg = `This profile ${profileId} is not provisioned`;
      throw new Error(errmsg);
    }

    const context = await contextForProvisioning(profileId, true);

    res.status(200).json(replaceForDescription(context));
  } catch (err) {
    const message = `Unable get provisioned profile bot json for profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const getAllProfileIdsUnderPending = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  try {
    const results = await getIdsForProfilesUnderPendingEditOrCreate();

    res.status(200).json(results);
  } catch (err) {
    const message = 'Unable fetch all profile ids that are under pending edit';
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const getProfileBotJsonUnderPending = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { profileId } = params;
  const { RequestModel } = dm;

  try {
    const results = await getIdsForProfilesUnderPendingEditOrCreate();

    if (Array.isArray(results) && !results.includes(Number(profileId))) {
      const errmsg = `This profile is not under any pending edit / create request`;
      throw new Error(errmsg);
    }

    let context;

    const requests = await RequestModel.findForProfile(profileId);
    // if the queried profile is under pending edit
    if (requests.length > 0) {
      const request = requests.pop();
      if (!request) {
        const errmsg = `Unable to get request`;
        throw new Error(errmsg);
      }

      context = await contextForEditing(profileId, true, request.editType, request.editObject);
    } else {
      // if the queried profile is under pending create
      context = await contextForProvisioning(profileId, true);
    }

    res.status(200).json(replaceForDescription(context));
  } catch (err) {
    const message = `Unable to get profile (currently under pending edit / create) bot json
    for profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

const getIdsForProfilesUnderPendingEditOrCreate = async (): Promise<number[]> => {
  const { RequestModel, ProfileModel } = dm;
  try {
    // process those profiles that are under pending EDIT
    const requests = await RequestModel.findAll();
    const profileIds = requests.map((request: Request) => request.profileId);

    // process those profiles that are under pending CREATE
    const profiles: ProjectProfile[] = await ProfileModel.findAll();

    for (const profile of profiles) {
      const result = await getProvisionStatus(profile);
      if (!result && profile.id) {
        profileIds.push(profile.id);
      }
    }
    return profileIds;
  } catch (err) {
    const message = 'Unable to get a list of profile ids for those that are under pending edit / create';
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};
