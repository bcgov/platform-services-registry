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

import { errorWithCode, logger } from '@bcgov/common-nodejs-utils';
import { Response } from 'express';
import DataManager from '../db';
import { ProjectProfile } from '../db/model/profile';
import { generateNamespacePrefix } from '../db/utils';
import { AuthenticatedUser } from '../libs/authmware';
import { AccessFlag } from '../libs/authorization';
import { fulfillRequest } from '../libs/fulfillment';
import { requestProjectProfileEdit } from '../libs/request';
import shared from '../libs/shared';
import { validateRequiredFields } from '../libs/utils';

const dm = new DataManager(shared.pgPool);

export const uniqueNamespacePrefix = async (): Promise<string | undefined> => {
  const { ProfileModel } = dm;
  const attempts = 3;
  const candidates = Array.from({ length: attempts }, () => generateNamespacePrefix())
  const promises = candidates.map(c => ProfileModel.isNamespacePrefixUnique(c));

  try {
    const results = await Promise.all(promises);
    const values = results.map((cur, idx) => {
      if (cur) {
        return candidates[idx];
      }

      return;
    }).filter(v => typeof v !== 'undefined');

    return values.pop();
  } catch (err) {
    logger.error(err.message);
    return;
  }
}

export const fetchAllProjectProfiles = async (
  { user }: { user: AuthenticatedUser }, res: Response): Promise<void> => {
  const { ProfileModel } = dm;

  try {
    let results;
    if (user.accessFlags.includes(AccessFlag.EditAll)) {
      results = await ProfileModel.findAll();
    } else {
      results = await ProfileModel.findProfilesByUserIdOrEmail(user.id, user.email);
    }

    res.status(200).json(results);
  } catch (err) {
    const message = 'Unable fetch all project profiles';
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProjectProfile = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId } = params;

  try {
    const projectDetails = await ProfileModel.findById(Number(profileId));

    res.status(200).json(projectDetails);
  } catch (err) {
    if (err.code) {
      throw err;
    }

    const message = `Unable fetch project profile with ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const createProjectProfile = async (
  { body, user }: { body: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { ProfileModel, ClusterModel } = dm;
  const data = { ...body, userId: user.id };

  // User cannot set the namespace prefix
  // If it exists, this overwrites it with a place holder value. It will be replaced
  // with the actual value further on.
  const rv = validateRequiredFields(ProfileModel.requiredFields, {
    ...data,
    namespacePrefix: 'placeholder',
    primaryClusterName: 'placeholder',
  });

  if (rv) {
    throw rv;
  }

  try {
    if (data.primaryClusterName !== undefined) {
      const cluster = await ClusterModel.findByName(data.primaryClusterName);
      if (!cluster) {
        throw new Error('Unable to find requested cluster');
      }
    } else {
      const defaultCluster = await ClusterModel.findDefault();
      data.primaryClusterName = defaultCluster.name;
    }

    const namespacePrefix = await uniqueNamespacePrefix();
    if (!namespacePrefix) {
      throw new Error('Unable to generate unique namespace prefix');
    }

    const results = await ProfileModel.create({ ...data, namespacePrefix });

    res.status(200).json(results);
  } catch (err) {
    const message = 'Unable create new project profile';
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

// TODO: enable updating name when we support display name changes
export const updateProjectProfile = async (
  { params, body, user }: { params: any, body: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { ProfileModel, RequestModel } = dm;
  const { profileId } = params;

  const rv = validateRequiredFields(ProfileModel.requiredFields, {
    ...body,
    userId: 'placeholder',
    namespacePrefix: 'placeholder',
    primaryClusterName: 'placeholder',
  });
  if (rv) {
    throw rv;
  }

  const {
    description,
    busOrgId,
    prioritySystem,
    notificationEmail,
    notificationSms,
    notificationMsTeams,
    paymentBambora,
    paymentPayBc,
    fileTransfer,
    fileStorage,
    geoMappingWeb,
    geoMappingLocation,
    schedulingCalendar,
    schedulingAppointments,
    idmSiteMinder,
    idmKeycloak,
    idmActiveDir,
    other,
    migratingLicenseplate,
  } = body;

  try {
    const currentProjectProfile: ProjectProfile = await ProfileModel.findById(profileId);
    const aBody = {
      description,
      busOrgId,
      prioritySystem,
      notificationEmail,
      notificationSms,
      notificationMsTeams,
      paymentBambora,
      paymentPayBc,
      fileTransfer,
      fileStorage,
      geoMappingWeb,
      geoMappingLocation,
      schedulingCalendar,
      schedulingAppointments,
      idmSiteMinder,
      idmKeycloak,
      idmActiveDir,
      other,
      migratingLicenseplate,
      name: currentProjectProfile.name,
      userId: currentProjectProfile.userId,
      namespacePrefix: currentProjectProfile.namespacePrefix,
      primaryClusterName: currentProjectProfile.primaryClusterName,
    };

    const editCompares = [
      currentProjectProfile.description !== description,
    ];
    const provisionerRelatedChanges = editCompares.some(editCompare => editCompare);
    if (provisionerRelatedChanges) {
      const request = await requestProjectProfileEdit(Number(profileId), { ...aBody, id: profileId }, user, false);
      await fulfillRequest(request);
      res.status(202).end();
    } else {
      const request = await requestProjectProfileEdit(
        Number(profileId), { ...aBody, id: profileId }, user, false
      );
      await ProfileModel.update(profileId, aBody);
      await RequestModel.updateCompletionStatus(Number(request.id));
      res.status(204).end();
    }
  } catch (err) {
    if (err.code) {
      throw err;
    }

    const message = `Unable update project profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const archiveProjectProfile = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId } = params;

  try {
    await ProfileModel.delete(profileId);

    res.status(204).end();
  } catch (err) {
    if (err.code) {
      throw err;
    }

    const message = 'Unable to archive project profile';
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};
