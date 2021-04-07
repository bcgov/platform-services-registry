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
<<<<<<< HEAD
import { Request } from '../db/model/request';
import { getQuotaSize } from '../libs/profile';
import { getAllowedQuotaSizes } from '../libs/quota';
import { requestProfileContactsEdit, requestProfileQuotaSizeEdit } from '../libs/request';
import shared from '../libs/shared';
import { validateRequiredFields } from '../libs/utils';
=======
import { getProfileCurrentQuotaSize } from '../libs/profile';
import { getAllowedQuotaSizes } from '../libs/quota';
import { fetchEditRequests, requestContactsEdit, requestQuotaSizeEdit } from '../libs/request';
import shared from '../libs/shared';
>>>>>>> 5fc9710 (refactor and modify unit tests)

const dm = new DataManager(shared.pgPool);

export const addContactToProfile = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId, contactId } = params;

  try {
    await ProfileModel.addContactToProfile(Number(profileId), Number(contactId));

<<<<<<< HEAD
    res.status(201).end();
=======
    res.status(204).end();
>>>>>>> 5fc9710 (refactor and modify unit tests)
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
  { params, body }: { params: any, body: any }, res: Response
): Promise<void> => {
  const { ContactModel } = dm;
  const { profileId } = params;
  const { productOwner, technicalContact } = body;
<<<<<<< HEAD
  const contacts = [productOwner, technicalContact];

  // TODO:(yh) add more data sanity check
  // check the passed contacts have no dupliates
  // check contact_id is associated with the queried profile_id
  // check role_id points to the legit role TC / PO
  contacts.forEach((contact: Contact): void => {
    const rv = validateRequiredFields(ContactModel.requiredFields.concat(['id']), contact);
    if (rv) {
      throw rv;
    }
  });

  try {
    const currentContacts: Contact[] = await ContactModel.findForProject(Number(profileId));

    const editCompares: boolean[] = [];
    contacts.forEach((contact: Contact): void => {
      const currentContact = currentContacts.filter(cc => cc.id === contact.id).pop();
      if (!currentContact) {
        throw new Error('Cant get current contact');
      }
      editCompares.push(currentContact.githubId !== contact.githubId);
      editCompares.push(currentContact.email !== contact.email);
    });

    const provisionerRelatedChanges = editCompares.some(editCompare => editCompare);
    if (provisionerRelatedChanges) {
      await requestProfileContactsEdit(Number(profileId), contacts);
      res.status(202).end();
    } else {
      const contactPromises = contacts.map((contact: Contact) => {
        if (!contact.id) {
          throw new Error('Cant get contact id');
        }
        return ContactModel.update(contact.id, contact);
      });
      await Promise.all(contactPromises);
      res.status(204).end();
    }
=======

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
      await requestContactsEdit(Number(profileId), body);
    } else {
      const updatePromises: any = [];
      contacts.forEach((contact: Contact) => {
        updatePromises.push(ContactModel.update(Number(contact.id), contact));
      });

      await Promise.all(updatePromises);
    }

    res.status(204).end();
>>>>>>> 5fc9710 (refactor and modify unit tests)
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
<<<<<<< HEAD
    const quotaSize: QuotaSize = await getQuotaSize(profile);
=======
    const quotaSize: QuotaSize = await getProfileCurrentQuotaSize(profile);
>>>>>>> 5fc9710 (refactor and modify unit tests)

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
<<<<<<< HEAD
    const quotaSize: QuotaSize = await getQuotaSize(profile);
    const allowedQuotaSizes: QuotaSize[] = getAllowedQuotaSizes(quotaSize);

    res.status(200).json(allowedQuotaSizes);
  } catch (err) {
    const message = `Unable to fetch allowed quota-sizes for profile ${profileId}`;
=======
    const quotaSize: QuotaSize = await getProfileCurrentQuotaSize(profile);
    const results = getAllowedQuotaSizes(quotaSize);

    res.status(200).json(results);
  } catch (err) {
    const message = `Unable to fetch quota options for profile ${profileId}`;
>>>>>>> 5fc9710 (refactor and modify unit tests)
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const updateProfileQuotaSize = async (
  { params, body }: { params: any, body: any }, res: Response
): Promise<void> => {
  const { ProfileModel } = dm;
  const { profileId } = params;
  const { requestedQuotaSize } = body;

  try {
    const profile: ProjectProfile = await ProfileModel.findById(profileId);
<<<<<<< HEAD
    const quotaSize: QuotaSize = await getQuotaSize(profile);
    const allowedQuotaSizes: QuotaSize[] = getAllowedQuotaSizes(quotaSize);

    // verify if requested quota size is valid
    if (!(requestedQuotaSize && allowedQuotaSizes.includes(requestedQuotaSize))) {
      throw new Error('Please provide correct requested quota size in body');
    }

    await requestProfileQuotaSizeEdit(Number(profileId), requestedQuotaSize);

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
=======
    const quotaSize: QuotaSize = await getProfileCurrentQuotaSize(profile);
    const allowedQuotaSizes = getAllowedQuotaSizes(quotaSize);

    // verify if requested quota size is valid
    if (!(requestedQuotaSize && allowedQuotaSizes.includes(requestedQuotaSize))) {
      const errmsg = 'Please provide correct requested quota size in body';
      throw new Error(errmsg);
    }

    await requestQuotaSizeEdit(Number(profileId), body);

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
>>>>>>> 5fc9710 (refactor and modify unit tests)
    if (err.code) {
      throw err;
    }

<<<<<<< HEAD
    const message = `Unable to fetch profile edit requests with profile ID ${profileId}`;
=======
    const message = `Unable fetch requests with profile ID ${profileId}`;
>>>>>>> 5fc9710 (refactor and modify unit tests)
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};
