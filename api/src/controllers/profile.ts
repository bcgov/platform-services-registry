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
import { USER_ROLES } from '../constants';
import DataManager from '../db';
import { Request, RequestEditType } from '../db/model/request';
import { generateNamespacePrefix } from '../db/utils';
import { AuthenticatedUser } from '../libs/authmware';
import { fulfillNamespaceEdit } from '../libs/fulfillment';
import { getDefaultCluster } from '../libs/primary-namespace-set';
import shared from '../libs/shared';
import { isNotAuthorized, validateObjProps } from '../libs/utils';

const dm = new DataManager(shared.pgPool);
const whichService = 'profile editing';

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
    if (user.roles.includes(USER_ROLES.ADMINISTRATOR)) {
      results = await ProfileModel.findAll();
    } else {
      results = await ProfileModel.findProfilesByUserId(user.id);
    }

    res.status(200).json(results);
  } catch (err) {
    const message = 'Unable fetch all project profiles';
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProjectProfile = async (
  { params, user }: { params: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId } = params;

  try {
    const record = await ProfileModel.findById(Number(profileId));

    const notAuthorized = isNotAuthorized(record, user);

    if (notAuthorized) {
      throw notAuthorized;
    }

    res.status(200).json(record);
  } catch (err) {
    if (err.code) {
      throw err
    }

    const message = `Unable fetch project profile with ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const createProjectProfile = async (
  { body, user }: { body: any, user: any }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const data = { ...body, userId: user.id };

  // User cannot set the namespace prefix OR primary cluster name (current default cluster).
  // If it exists, this overwrites it with a place holder value. It will be replaced
  // with the actual value further on.
  const rv = validateObjProps(ProfileModel.requiredFields, {
    ...data,
    namespacePrefix: 'placeholder',
    primaryClusterName: 'placeholder',
  });

  if (rv) {
    throw rv;
  }

  try {
    const namespacePrefix = await uniqueNamespacePrefix();
    if (!namespacePrefix) {
      throw errorWithCode(500, 'Unable to generate unique namespace prefix');
    }

    const defaultCluster = await getDefaultCluster();
    if (!defaultCluster) {
      throw errorWithCode(500, 'Unable to set primary cluster id based on default cluster');
    }

    const results = await ProfileModel.create({ ...data, namespacePrefix, primaryClusterName: defaultCluster.name });

    res.status(200).json(results);
  } catch (err) {
    const message = 'Unable create new project profile';
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const updateProjectProfile = async (
  { params, body, user }: { params: any, body: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId } = params;
  const {
    name,
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
  } = body;

  try {
    const record = await ProfileModel.findById(profileId);
    const aBody = {
      name,
      description,
      busOrgId,
      prioritySystem,
      userId: record.userId,
      namespacePrefix: record.namespacePrefix,
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
      primaryClusterName: record.primaryClusterName,
    };

    const notAuthorized = isNotAuthorized(record, user);

    if (notAuthorized) {
      throw notAuthorized;
    }

    const rv = validateObjProps(ProfileModel.requiredFields, aBody);

    if (rv) {
      throw rv;
    }

    const results = await ProfileModel.update(profileId, aBody);

    res.status(200).json(results);
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
  { params, user }: { params: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId } = params;

  try {
    const record = await ProfileModel.findById(profileId);

    const notAuthorized = isNotAuthorized(record, user);

    if (notAuthorized) {
      throw notAuthorized;
    }

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

export const addContactToProfile = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId, contactId } = params;

  try {
    await ProfileModel.addContactToProfile(Number(profileId), Number(contactId));

    res.status(202).end();
  } catch (err) {
    const message = `Unable to create contact`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProfileContacts = async (
  { params, user }: { params: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { ContactModel, ProfileModel } = dm;
  const { profileId } = params;

  try {
    const record = await ProfileModel.findById(Number(profileId));

    const notAuthorized = isNotAuthorized(record, user);

    if (notAuthorized) {
      throw notAuthorized;
    }

    const results = await ContactModel.findForProject(Number(profileId));

    res.status(200).json(results);
  } catch (err) {
    if (err.code) {
      throw err;
    }

    const message = `Unable fetch profile contacts with profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProfileEditRequests = async (
  { params, user }: { params: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { RequestModel, ProfileModel } = dm;
  const { profileId } = params;

  try {
    const record = await ProfileModel.findById(Number(profileId));

    const notAuthorized = isNotAuthorized(record, user);

    if (notAuthorized) {
      throw notAuthorized;
    }

    const results = await RequestModel.findForProfile(Number(profileId));

    res.status(200).json(results);
  } catch (err) {
    if (err.code) {
      throw err;
    }

    const message = `Unable fetch profile contacts with profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const requestProfileEdit = async (
  { params, body }: { params: any, body: any }, res: Response
): Promise<void> => {
  const { RequestModel } = dm;
  const { profileId } = params;
  const profile = body;

  try {
    const editType = RequestEditType.Description;
    const editObject = profile.description;
    if (!editObject) {
      const errmsg = 'Cant generate request edit object';
      throw new Error(errmsg);
    }

    const { natsContext, natsSubject } = await fulfillNamespaceEdit(profileId, editType, editObject);

    // create Request record for contact edit
    await RequestModel.create({
      profileId,
      editType,
      editObject: JSON.stringify(profile),
      natsSubject,
      natsContext: JSON.stringify(natsContext),
    });

    res.status(204).end();

  } catch (err) {
    const message = `Unable to update profile`;
    logger.error(`${message}, err = ${err.message}`);
    throw errorWithCode(message, 500);
  }
};

export const processProfileEdit = async (request: Request): Promise<void> => {
  const { ProfileModel } = dm;
  try {
    const { profileId, editObject } = request;
    const profile = JSON.parse(editObject);
    await ProfileModel.update(Number(profileId), profile);
    return;
  } catch (err) {
    const message = `Unable to process requestId ${request.id} on bot callback for ${whichService}`;
    logger.error(`${message}, err = ${err.message}`);
    throw err;
  }
};
