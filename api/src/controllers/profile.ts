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
import { generateNamespacePrefix } from '../db/utils';
import { AuthenticatedUser } from '../libs/authmware';
import shared from '../libs/shared';
import { isNotAuthorized, validateObjProps } from '../libs/utils';

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

  // User cannot set the namespace prefix. If it exists, this
  // overwrites it with a place holder value. It will be replaced
  // with the actual value further on.
  const rv = validateObjProps(ProfileModel.requiredFields, {
    ...data,
    namespacePrefix: 'placeholder',
  });

  if (rv) {
    throw rv;
  }

  try {
    const namespacePrefix = await uniqueNamespacePrefix();

    if (!namespacePrefix) {
      throw errorWithCode(500, 'Unable to generate unique namespace prefix');
    }

    const results = await ProfileModel.create({ ...data, namespacePrefix });

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
    categoryId,
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
      categoryId,
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
      throw err
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
      throw err
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
      throw err
    }

    const message = `Unable fetch profile contacts with profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProfileEditRequests = async (
  { params, body }: { params: any, body: any }, res: Response
): Promise<void> => {
  try {
    res.status(201).end();
  } catch (err) {
    const message = `Unable to update quota`;
    logger.error(`${message}, err = ${err.message}`);
    throw errorWithCode(message, 500);
  }
};
