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

import { logger } from '@bcgov/common-nodejs-utils';
import DataManager from '../db';
import { Contact } from '../db/model/contact';
import { ProjectProfile } from '../db/model/profile';
import { QuotaSize } from '../db/model/quota';
import { Request, RequestEditType } from '../db/model/request';
import { fulfillEditRequest } from '../libs/fulfillment';
import { updateQuotaSize } from '../libs/profile';
import shared from './shared';

const dm = new DataManager(shared.pgPool);
const { RequestModel, QuotaModel } = dm;

export const requestProjectProfileEdit = async (profileId: number, newProjectProfile: ProjectProfile): Promise<Request> => {
    try {
        const editObject = newProjectProfile;

        return await requestEdit(RequestEditType.ProjectProfile, editObject, profileId);
    } catch (err) {
        const message = `Unable to request project-profile edit for profile ${profileId}`;
        logger.error(`${message}, err = ${err.message}`);

        throw err;
    }
};

export const processProjectProfileEdit = async (request: Request): Promise<void> => {
    const { ProfileModel } = dm;
    try {
        const newProjectProfile = request.editObject;

        await ProfileModel.update(newProjectProfile.id, newProjectProfile);
    } catch (err) {
        const message = `Unable to process project-profile edit for request ${request.id}`;
        logger.error(`${message}, err = ${err.message}`);

        throw err;
    }
};

export const requestProfileContactsEdit = async (profileId: number, newContacts: Contact[]): Promise<Request> => {
    try {
        const editObject = newContacts;

        return await requestEdit(RequestEditType.Contacts, editObject, profileId);
    } catch (err) {
        const message = `Unable to request contacts edit for profile ${profileId}`;
        logger.error(`${message}, err = ${err.message}`);

        throw err;
    }
};

export const processProfileContactsEdit = async (request: Request): Promise<void> => {
    const { ContactModel } = dm;

    try {
        const newContacts: Contact[] = request.editObject;

        const contactPromises = newContacts.map((newContact: Contact) => {
            if (!newContact.id) {
                throw new Error('Cant get contact id');
            }
            return ContactModel.update(newContact.id, newContact);
        });

        await Promise.all(contactPromises);
    } catch (err) {
        const message = `Unable to process profile contacts edit for request ${request.id}`;
        logger.error(`${message}, err = ${err.message}`);

        throw err;
    }
};

export const requestProfileQuotaSizeEdit = async (profileId: number, requestedQuotaSize: QuotaSize): Promise<Request> => {
    try {
        const editObject = {
            quota: requestedQuotaSize,
            quotas: await QuotaModel.findForQuotaSize(requestedQuotaSize),
        };

        return await requestEdit(RequestEditType.QuotaSize, editObject, profileId);
    } catch (err) {
        const message = `Unable to request quota-size edit for profile ${profileId}`;
        logger.error(`${message}, err = ${err.message}`);

        throw err;
    }
};

export const processProfileQuotaSizeEdit = async (request: Request): Promise<void> => {
    const { ProfileModel } = dm;

    try {
        const { profileId, editObject } = request;
        const { quota } = editObject;
        const profile = await ProfileModel.findById(profileId);

        await updateQuotaSize(profile, quota);
    } catch (err) {
        const message = `Unable to process quota-size edit for request ${request.id}`;
        logger.error(`${message}, err = ${err.message}`);

        throw err;
    }
};

const requestEdit = async (editType: RequestEditType, editObject: any, profileId: number): Promise<Request> => {
    try {
        const existingRequests = await RequestModel.findForProfile(profileId);
        if (existingRequests.length > 0) {
            throw new Error('Cant proceed as the profile has existing request');
        }

        const { natsContext, natsSubject } = await fulfillEditRequest(profileId, editType, editObject);
        return await RequestModel.create({
            profileId,
            editType,
            editObject,
            natsSubject,
            natsContext,
        });
    } catch (err) {
        const message = `Unable to process request edit`;
        logger.error(`${message}, err = ${err.message}`);

        throw err;
    }
};
