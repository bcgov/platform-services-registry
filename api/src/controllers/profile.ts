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

'use strict';

import { errorWithCode, logger } from '@bcgov/common-nodejs-utils';
import { Response } from 'express';
import DataManager from '../db';
import { ProjectProfile } from '../db/model/profile';
import { QuotaSize } from '../db/model/quota';
import { getProfileCurrentQuotaSize, getProfileQuotaOptions } from '../libs/profile';
import shared from '../libs/shared';

const dm = new DataManager(shared.pgPool);

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
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { ContactModel } = dm;
  const { profileId } = params;

  try {
    const projectContacts = await ContactModel.findForProject(Number(profileId));

    res.status(200).json(projectContacts);
  } catch (err) {
    if (err.code) {
      throw err;
    }

    const message = `Unable fetch profile contacts with profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProfileQuotaSize = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId } = params;

  try {
    const profile = await ProfileModel.findById(Number(profileId));
    const quotaSize: QuotaSize = await getProfileCurrentQuotaSize(profile);

    res.status(200).json(quotaSize);
  } catch (err) {
    if (err.code) {
      throw err;
    }

    const message = `Unable fetch profile quota size with profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProfileQuotaOptions = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId } = params;

  try {
    const profile: ProjectProfile = await ProfileModel.findById(profileId);
    const quotaOptions: QuotaSize[] = await getProfileQuotaOptions(profile);

    res.status(200).json(quotaOptions);
  } catch (err) {
    const message = `Unable to fetch quota options for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProfileEditRequests = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { RequestModel } = dm;
  const { profileId } = params;

  try {
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
