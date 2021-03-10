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
import { Contact } from '../db/model/contact';
import { RequestEditType, RequestType } from '../db/model/request';
import { AuthenticatedUser } from '../libs/authmware';
import { fulfillEditRequest } from '../libs/fulfillment';
import { getProfileQuotaOptions } from '../libs/profile';
import shared from '../libs/shared';
import { formatNatsContactObject } from '../libs/utils';

const dm = new DataManager(shared.pgPool);


export const requestProjectProfileCreate = async (
  { params, body, user }: { params: any, body: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { RequestModel } = dm;
  const { profileId } = params;

  try {
    // create Request record for project-profile edit
    await RequestModel.create({
      profileId,
      type: RequestType.Create,
      requires_human_action: false,
      is_active: true,
      user_id: user.id,
    });

    res.status(204).end();
  } catch (err) {
    const message = `Unable to update profile`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const requestProjectProfileUpdate = async (
  { params, body, user }: { params: any, body: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { RequestModel } = dm;
  const { profileId } = params;

  try {
    // create Request record for project-profile edit
    await RequestModel.create({
      profileId,
      type: RequestType.Create,
      requires_human_action: true,
      is_active: true,
      user_id: user.id,
    });

    res.status(204).end();
  } catch (err) {
    const message = `Unable to update profile`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

// TODO:(yh) run a check for the following edit async
// to see if the profile has any existing request
// if so, serve forbidden status code
export const requestProjectProfileEdit = async (
  { params, body, user }: { params: any, body: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { RequestModel } = dm;
  const { profileId } = params;
  const profile = body;

  try {
    const editType = RequestEditType.Description;
    const editObject = profile.description;
    const requiresHumanAction = false;

    if (!editObject) {
      const errmsg = 'Cant generate request edit object';
      throw new Error(errmsg);
    }

    // create Request record for project-profile edit
    const request = await RequestModel.create({
      profileId,
      editType,
      editObject: JSON.stringify(profile),
      type: RequestType.Edit,
      requires_human_action: requiresHumanAction,
      is_active: true,
      user_id: user.id,
    });

    if (!requiresHumanAction){
      await fulfillEditRequest(profileId, request);
    }

    res.status(204).end();
  } catch (err) {
    const message = `Unable to update profile`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const requestProfileContactsEdit = async (
  { params, body, user }: { params: any, body: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { RequestModel, ContactModel } = dm;
  const { profileId } = params;
  const { productOwner, technicalContact } = body;

  try {
    // process request params to get profileId and define RequestEditType
    const editType = RequestEditType.Contacts;
    const contacts = [productOwner, technicalContact]
    const requiresHumanAction = false;

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

      // create Request record for contact edit
      const request = await RequestModel.create({
        profileId,
        editType,
        editObject: JSON.stringify(contacts),
        type: RequestType.Edit,
        requires_human_action: requiresHumanAction,
        is_active: true,
        user_id: user.id,
      });


      if (!requiresHumanAction){
        await fulfillEditRequest(profileId, request);
      }

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


export const requestProfileQuotaEdit = async (
  { params, body, user }: { params: any, body: any, user: AuthenticatedUser }, res: Response
): Promise<void> => {
  const { RequestModel, ProfileModel, QuotaModel } = dm;
  const { profileId } = params;
  const { requestedQuotaSize } = body;

  try {
    const profile = await ProfileModel.findById(profileId);
    const quotaOptions = await getProfileQuotaOptions(profile);
    const requiresHumanAction = false;

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

    // 2. Save request to track later
    const request = await RequestModel.create({
      profileId,
      editType,
      editObject: JSON.stringify(editObject),
      type: RequestType.Edit,
      requires_human_action: requiresHumanAction,
      is_active: true,
      user_id: user.id,
    });

    if (!requiresHumanAction){
      await fulfillEditRequest(profileId, request);
    }

    res.status(204).end();
  } catch (err) {
    const message = `Unable to request quota size for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};
