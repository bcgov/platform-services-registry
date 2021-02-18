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
import DataManager from '../db';
import { Contact } from '../db/model/contact';
import { ProjectProfile } from '../db/model/profile';
import { QuotaSize } from '../db/model/quota';
import { RequestEditType } from '../db/model/request';
import { AuthenticatedUser } from '../libs/authmware';
import { getAuthorization } from '../libs/authorization';
import { fulfillEditRequest } from '../libs/fulfillment';
import { getProfileCurrentQuotaSize, getProfileQuotaOptions } from '../libs/profile';
import shared from '../libs/shared';
import { formatNatsContactObject } from '../libs/utils';

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
  { params, user }: { params: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { ContactModel } = dm;
  const { profileId } = params;

  try {
    const projectContacts = await ContactModel.findForProject(Number(profileId));

    const isAuthorized = getAuthorization(profileId, user, undefined, projectContacts);

    if (!(isAuthorized)) {
      throw isAuthorized;
    }

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
  { params, user }: { params: any, user: AuthenticatedUser }, res: Response
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

export const fetchProfileEditRequests = async (
  { params, user }: { params: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { RequestModel, } = dm;
  const { profileId } = params;

  try {
    const isAuthorized = getAuthorization(profileId, user);

    if (!(isAuthorized)) {
      throw isAuthorized;
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

// TODO:(yh) think of a way to run a base method for the following edit async to check
// 0. if the profile has any existing request
// 1. if profile id is in valid format
// 2. user is authorized to operate around this profile
export const requestProjectProfileEdit = async (
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

    const { natsContext, natsSubject } = await fulfillEditRequest(profileId, editType, editObject);

    // create Request record for project-profile edit
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

export const requestProfileContactsEdit = async (
  { params, body }: { params: any, body: any }, res: Response
): Promise<void> => {
  const { RequestModel, ContactModel } = dm;
  const { profileId } = params;
  const { productOwner, technicalContact } = body;

  try {
    // process request params to get profileId and define RequestEditType
    const editType = RequestEditType.Contacts;
    const contacts = [productOwner, technicalContact]

    // Step 1. GET current contact details
    const currentPOvalues = await ContactModel.findById(productOwner.id);
    const currentTCvalues = await ContactModel.findById(technicalContact.id);

    // Step 2. Compare if GithubId or Email values were changed
    const provisionerEdits = [
      currentPOvalues.githubId !== productOwner.githubId,
      currentPOvalues.email !== productOwner.email,
      currentTCvalues.githubId !== technicalContact.githubId,
      currentTCvalues.email !== technicalContact.email,
    ];

    // Step 3. Compare if first or last name details were altered
    const contactNameEdits = [
      currentPOvalues.firstName !== productOwner.firstName,
      currentPOvalues.lastName !== productOwner.lastName,
      currentTCvalues.firstName !== technicalContact.firstName,
      currentTCvalues.lastName !== technicalContact.lastName,
    ];

    // Step 4. Assess if provisioner or contact edits occurred.
    const provisionerEdit = provisionerEdits.some(provisionerEditsChecks => provisionerEditsChecks);
    const contactNameEdit = contactNameEdits.some(contactNameEditsChecks => contactNameEditsChecks);

    if (provisionerEdit) {
      // process request body for natsContext
      const editObject = await formatNatsContactObject(body);
      if (!editObject) {
        const errmsg = 'Cant generate request edit object';
        throw new Error(errmsg);
      }

      const { natsContext, natsSubject } = await fulfillEditRequest(profileId, editType, editObject);

      // create Request record for contact edit
      await RequestModel.create({
        profileId,
        editType,
        editObject: JSON.stringify(contacts),
        natsSubject,
        natsContext: JSON.stringify(natsContext),
      });
    } else if (contactNameEdit) {
      const updatePromises: any = [];
      contacts.forEach((contact: Contact) => {
        updatePromises.push(ContactModel.update(Number(contact.id), contact));
      })
      await Promise.all(updatePromises);
    }
    res.status(204).end();
  } catch (err) {
    const message = `Unable to update contact`;
    logger.error(`${message}, err = ${err.message}`);
    throw errorWithCode(message, 500);
  }
};

export const fetchProfileQuotaOptions = async (
  { params, user }: { params: any, user: AuthenticatedUser }, res: Response
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

export const requestProfileQuotaEdit = async (
  { params, user, body }: { params: any, user: AuthenticatedUser, body: any }, res: Response
): Promise<void> => {
  const { RequestModel, ProfileModel, QuotaModel } = dm;
  const { profileId } = params;
  const { requestedQuotaSize } = body;

  try {
    const profile = await ProfileModel.findById(profileId);
    const quotaOptions = await getProfileQuotaOptions(profile);

    // 0. Verify if requested quota size is valid
    if (!(requestedQuotaSize && quotaOptions.includes(requestedQuotaSize))) {
      const errmsg = 'Please provide correct requested quota size in body';
      throw new Error(errmsg);
    }

    // 1. Pass request to provisioning bot
    const editObject = {
      quota: requestedQuotaSize,
      quotas: await QuotaModel.findForQuotaSize(requestedQuotaSize),
    };
    const editType = RequestEditType.QuotaSize;
    const { natsContext, natsSubject } = await fulfillEditRequest(profileId, editType, editObject);

    // 2. Save request to track later
    await RequestModel.create({
      profileId,
      editType,
      editObject: JSON.stringify(editObject),
      natsSubject,
      natsContext: JSON.stringify(natsContext),
    });

    res.status(204).end();
  } catch (err) {
    const message = `Unable to request quota size for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};
