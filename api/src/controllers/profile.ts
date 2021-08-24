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
import { PROFILE_STATUS } from '../constants';
import DataManager from '../db';
import { Contact } from '../db/model/contact';
import { ProjectProfile } from '../db/model/profile';
import { QuotaSize } from '../db/model/quota';
import { Request } from '../db/model/request';
import { AuthenticatedUser } from '../libs/authmware';
import { fulfillRequest } from '../libs/fulfillment';
import { getQuotaSize, updateProfileStatus } from '../libs/profile';
import { getAllowedQuotaSizes } from '../libs/quota';
import { requestProfileContactsEdit, requestProfileQuotaSizeEdit, requestProjectProfileCreate } from '../libs/request';
import shared from '../libs/shared';
import { fetchAllDashboardProjects } from '../services/profile';

const dm = new DataManager(shared.pgPool);

export const addContactToProfile = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId, contactId } = params;

  try {
    await ProfileModel.addContactToProfile(Number(profileId), Number(contactId));

    res.status(201).end();
  } catch (err) {
    const message = `Unable to add contact to profile`;
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
  { params, body, user }: { params: any, body: Contact[], user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { ContactModel, RequestModel } = dm;
  const { profileId } = params;
  const contacts = body;
  // TODO (yhf): add more data sanity check
  // check the passed contacts have no dupliates
  // check contact_id is associated with the queried profile_id
  // check role_id points to the legit role TC / PO

  try {
    const currentContacts: Contact[] = await ContactModel.findForProject(Number(profileId));
    const deletedOrNewContact: boolean = true;
    const provisionerContactEdit: boolean[] = [];

    // 1. Check for provisioner related changes
    contacts.forEach((contact: Contact): void => {
      const currentContact = currentContacts.filter(cc => cc.id === contact.id).pop();
      if (currentContact) {
        provisionerContactEdit.push(currentContact.githubId !== contact.githubId);
        provisionerContactEdit.push(currentContact.email !== contact.email);
      } else {
        provisionerContactEdit.push(deletedOrNewContact)
      }
    });

    // 2. Create request if provisionerRelatedChanges
    const isProvisionerRelatedChanges = provisionerContactEdit.some(contactEdit => contactEdit);
    if (isProvisionerRelatedChanges) {
      const editRequest = await requestProfileContactsEdit(Number(profileId), contacts, user);
      await fulfillRequest(editRequest);
      return res.status(202).end();
    }

    // 3. Update DB if changes are trivial (contact name)
    const request = await requestProfileContactsEdit(Number(profileId), body, user);

    const contactPromises = contacts.map((contact: Contact) => {
      if (!contact.id) {
        throw new Error('Cant get contact id');
      }
      return ContactModel.update(contact.id, contact);
    });
    await Promise.all(contactPromises);

    await updateProfileStatus(Number(profileId), PROFILE_STATUS.PROVISIONED)
    await RequestModel.updateCompletionStatus(Number(request.id));

    return res.status(204).end();
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
    const quotaSize: QuotaSize = await getQuotaSize(profile);

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
    const quotaSize: QuotaSize = await getQuotaSize(profile);
    const allowedQuotaSizes: QuotaSize[] = getAllowedQuotaSizes(quotaSize);

    res.status(200).json(allowedQuotaSizes);
  } catch (err) {
    const message = `Unable to fetch allowed quota-sizes for profile ${profileId}`;
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
    const quotaSize: QuotaSize = await getQuotaSize(profile);
    const allowedQuotaSizes: QuotaSize[] = getAllowedQuotaSizes(quotaSize);
    const requiresHumanAction = true;

    // verify if requested quota size is valid
    if (!(requestedQuotaSize && allowedQuotaSizes.includes(requestedQuotaSize))) {
      throw new Error('Please provide correct requested quota size in body');
    }

    await requestProfileQuotaSizeEdit(Number(profileId), requestedQuotaSize, user, requiresHumanAction);

    res.status(204).end();
  } catch (err) {
    const message = `Unable to update quota-size for profile ${profileId}`;
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
    const editRequests: Request[] = await RequestModel.findForProfile(Number(profileId));

    res.status(200).json(editRequests);
  } catch (err) {
    if (err.code) {
      throw err;
    }

    const message = `Unable to fetch profile edit requests with profile ID ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const createProjectRequest = async (
  { params, user }: { params: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { profileId } = params;
  try {
    const requiresHumanAction = true;
    await requestProjectProfileCreate(Number(profileId), user, requiresHumanAction);

    res.status(201).end();
  } catch (err) {
    const message = `Unable to add contact to profile`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const fetchDashboardProjectProfiles = async (
  { user }: { user: AuthenticatedUser }, res: Response): Promise<void> => {

  try {
    const results = await fetchAllDashboardProjects(user);

    res.status(200).json(results);
  } catch (err) {
    const message = 'Unable fetch all project profiles';
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};
