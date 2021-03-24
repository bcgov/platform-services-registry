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
import { Contact } from '../db/model/contact';
import { ProjectProfile } from '../db/model/profile';
import { QuotaSize } from '../db/model/quota';
import { AuthenticatedUser } from '../libs/authmware';
import { getProfileCurrentQuotaSize } from '../libs/profile';
import { getAllowedQuotaSizes } from '../libs/quota';
import { fetchEditRequests, requestContactsEdit, requestQuotaSizeEdit } from '../libs/request';
import shared from '../libs/shared';

const dm = new DataManager(shared.pgPool);

export const addContactToProfile = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId, contactId } = params;

  try {
    await ProfileModel.addContactToProfile(Number(profileId), Number(contactId));

    res.status(204).end();
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

export const updateProfileContacts = async (
  { params, body, user }: { params: any, body: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { ContactModel, RequestModel } = dm;
  const { profileId } = params;
  const { productOwner, technicalContact } = body;

  try {
    const contacts = [productOwner, technicalContact];
    const currentPOvalues = await ContactModel.findById(productOwner.id);
    const currentTCvalues = await ContactModel.findById(technicalContact.id);

    const editCompares = [
      currentPOvalues.githubId !== productOwner.githubId,
      currentPOvalues.email !== productOwner.email,
      currentTCvalues.githubId !== technicalContact.githubId,
      currentTCvalues.email !== technicalContact.email,
    ];
    const provisionerRelatedChanges = editCompares.some(editCompare => editCompare);

    if (provisionerRelatedChanges) {
      await requestContactsEdit(Number(profileId), body, user, provisionerRelatedChanges);
    } else {
      const request = await requestContactsEdit(Number(profileId), body, user, provisionerRelatedChanges);

      const updatePromises: any = [];
      contacts.forEach((contact: Contact) => {
        updatePromises.push(ContactModel.update(Number(contact.id), contact));
      });

      await Promise.all(updatePromises);

      await RequestModel.isComplete(Number(request.id));
    }

    res.status(204).end();
  } catch (err) {
    const message = `Unable to update contacts with profile ID ${profileId}`;
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
    const profile: ProjectProfile = await ProfileModel.findById(Number(profileId));
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

export const fetchProfileAllowedQuotaSizes = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId } = params;

  try {
    const profile: ProjectProfile = await ProfileModel.findById(profileId);
    const quotaSize: QuotaSize = await getProfileCurrentQuotaSize(profile);
    const results = getAllowedQuotaSizes(quotaSize);

    res.status(200).json(results);
  } catch (err) {
    const message = `Unable to fetch quota options for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const updateProfileQuotaSize = async (
  { params, body, user }: { params: any, body: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId } = params;
  const { requestedQuotaSize } = body;

  try {
    const profile: ProjectProfile = await ProfileModel.findById(profileId);
    const quotaSize: QuotaSize = await getProfileCurrentQuotaSize(profile);
    const allowedQuotaSizes = getAllowedQuotaSizes(quotaSize);
    const requiresHumanAction = true;

    // verify if requested quota size is valid
    if (!(requestedQuotaSize && allowedQuotaSizes.includes(requestedQuotaSize))) {
      const errmsg = 'Please provide correct requested quota size in body';
      throw new Error(errmsg);
    }

    await requestQuotaSizeEdit(Number(profileId), body, user, requiresHumanAction);

    res.status(204).end();
  } catch (err) {
    const message = `Unable to request quota size for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchProfileEditRequests = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { profileId } = params;

  try {
    const results = await fetchEditRequests(profileId);

    res.status(200).json(results);
  } catch (err) {
    if (err.code) {
      throw err;
    }

    const message = `Unable fetch requests with profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};
