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
import { Request, Response } from 'express';
import DataManager from '../db';
import { ProjectProfile } from '../db/model/profile';
import { RequestEditType, RequestType } from '../db/model/request';
import { contextForEditing, contextForProvisioning } from '../libs/fulfillment';
import { getProvisionStatus } from '../libs/profile';
import shared from '../libs/shared';
import { replaceForDescription } from '../libs/utils';

const dm = new DataManager(shared.pgPool);

export const getAllProvisionedProfileIds = async (
  req: Request, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const clusterName: any = req.query['cluster-name'];

  if (!(clusterName === undefined || typeof clusterName === 'string')) {
    throw errorWithCode('Unable to determine the provided cluster name', 400);
  }

  try {
    let profiles: ProjectProfile[] = await ProfileModel.findAll();
    if (clusterName !== undefined) {
      profiles = await filterProfilesBySelectedClusterName(profiles, clusterName);
    }

    const provisionedProfileIds: number[] = [];
    for (const profile of profiles) {
      const isProvisioned: boolean = await getProvisionStatus(profile);
      if (isProvisioned && profile.id) {
        provisionedProfileIds.push(profile.id);
      }
    }

    res.status(200).json(provisionedProfileIds);
  } catch (err) {
    const message = 'Unable to fetch all provisioned profile ids';
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
    const message = `Unable to get provisioned profile bot json for profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const getAllProfileIdsUnderPending = async (
  req: Request, res: Response
): Promise<void> => {
  const clusterName: any = req.query['cluster-name'];

  if (!(clusterName === undefined || typeof clusterName === 'string')) {
    throw errorWithCode('Unable to determine the provided cluster name', 400);
  }

  try {
    let profiles: ProjectProfile[] = await getProfilesUnderPendingEditOrCreate();
    if (clusterName !== undefined) {
      profiles = await filterProfilesBySelectedClusterName(profiles, clusterName);
    }

    res.status(200).json(profiles.map(p => p.id));
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
    const profiles: ProjectProfile[] = await getProfilesUnderPendingEditOrCreate();
    const profileIds: (number | undefined)[] = profiles.map(p => p.id);
    if (!profileIds.includes(Number(profileId))) {
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
      switch (request.type) {
        case RequestType.Create:
          context = await contextForProvisioning(profileId, false);
          break;
        case RequestType.Edit:
          if (!request.editType){
            const errmsg = `Unable to get request edit Type`;
            throw new Error(errmsg);
          }
          if (request.editType === RequestEditType.ProjectProfile) {
            request.editObject = JSON.stringify(request.editObject)
          }

          context = await contextForEditing(profileId, request.editType, request.editObject);
          break;
        default:
          throw new Error(`Invalid type for request ${request.id}`);
        }
    }
    res.status(200).json(replaceForDescription(context));
  } catch (err) {
    const message = `Unable to get profile (currently under pending edit / create) bot json
    for profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

const getProfilesUnderPendingEditOrCreate = async (): Promise<ProjectProfile[]> => {
  const { RequestModel, ProfileModel } = dm;
  try {
    // process those profiles that are under pending EDIT
    const requests = await RequestModel.findActiveByFilter('requires_human_action', false );
    const profileUnderRequestPromises: Promise<ProjectProfile>[] =
      requests.map((request) => ProfileModel.findById(request.profileId));

    const profilesUnderPendingEdit: ProjectProfile[] = await Promise.all(profileUnderRequestPromises);

    // process those profiles that are under pending CREATE
    const profilesUnderPendingCreate: ProjectProfile[] = [];

    const profiles: ProjectProfile[] = await ProfileModel.findAll();
    for (const profile of profiles) {
      const isProvisioned = await getProvisionStatus(profile);
      if (!isProvisioned) {
        profilesUnderPendingCreate.push(profile);
      }
    }

    return profilesUnderPendingEdit.concat(profilesUnderPendingCreate);
  } catch (err) {
    const message = 'Unable to get a list of profiles for those that are under pending edit / create';
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

const filterProfilesBySelectedClusterName = async (profiles: ProjectProfile[], clusterName: string):
  Promise<ProjectProfile[]> => {
  try {
    return profiles.filter((profile: ProjectProfile) => profile.primaryClusterName === clusterName);

  } catch (err) {
    const message = 'Unable to filter a list of profiles by selected cluster name';
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};
