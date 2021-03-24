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
import { Request, RequestEditType, RequestType } from '../db/model/request';
import { AuthenticatedUser } from './authmware';
import shared from './shared';

const dm = new DataManager(shared.pgPool);
const { RequestModel, QuotaModel } = dm;

export const requestProjectProfileCreate = async (profileId: number, user: AuthenticatedUser, requiresHumanAction: boolean): Promise<Request> => {
    try {
        const requestType = RequestType.Create;

        return await createRequest(requestType, user.id, requiresHumanAction, profileId);
    } catch (err) {
        const message = `Unable to create request for profile ${profileId}`;
        logger.error(`${message}, err = ${err.message}`);

        throw err;
    }
};

export const requestProjectProfileEdit = async (profileId: number, body: any, user: AuthenticatedUser, requiresHumanAction: boolean): Promise<Request> => {
    try {
        const requestType = RequestType.Edit;
        const editType = RequestEditType.ProjectProfile;
        const editObject = body;

        return await createRequest(requestType, user.id, requiresHumanAction, profileId, editType, editObject);
    } catch (err) {
        const message = `Unable to request project-profile edit for profile ${profileId}`;
        logger.error(`${message}, err = ${err.message}`);

        throw err;
    }
};

export const requestContactsEdit = async (profileId: number, body: any, user: AuthenticatedUser, requiresHumanAction: boolean): Promise<Request> => {
    if (!profileId) {
        throw new Error('Cant get profile id');
    }
    const { productOwner, technicalContact } = body;
    try {
        const requestType = RequestType.Edit;
        const editType = RequestEditType.Contacts;
        const editObject = [productOwner, technicalContact];

        return await createRequest(requestType, user.id, requiresHumanAction, profileId, editType, editObject);
    } catch (err) {
        const message = `Unable to request contacts edit for profile ${profileId}`;
        logger.error(`${message}, err = ${err.message}`);

        throw err;
    }
};

export const requestQuotaSizeEdit = async (profileId: number, body: any, user: AuthenticatedUser, requiresHumanAction: boolean): Promise<Request> => {
    const { requestedQuotaSize } = body;

    try {
        const requestType = RequestType.Edit;
        const editType = RequestEditType.QuotaSize;
        const editObject = {
            quota: requestedQuotaSize,
            quotas: await QuotaModel.findForQuotaSize(requestedQuotaSize),
        };

        return await createRequest(requestType, user.id, requiresHumanAction, profileId, editType, editObject);
    } catch (err) {
        const message = `Unable to request quota edit for profile ${profileId}`;
        logger.error(`${message}, err = ${err.message}`);

        throw err;
    }
};

export const fetchEditRequests = async (profileId: number): Promise<Request[]> => {
    try {
        return await RequestModel.findForProfile(profileId);
    } catch (err) {
        const message = `Unable to fetch existing edit requests for profile ${profileId}`;
        logger.error(`${message}, err = ${err.message}`);

        throw err;
    }
};

const createRequest = async (type: RequestType, userId: number, requiresHumanAction: boolean, profileId?: number, editType?: RequestEditType, editObject?: any): Promise<Request> => {
    if (!editObject) {
        throw new Error('Cant generate request edit object');
    }
    if (!profileId) {
        throw new Error('Cant get profile id');
    }

    const existingRequests = await fetchEditRequests(profileId);
    if (existingRequests.length > 0) {
        throw new Error('Cant proceed due to existing request');
    }

    return await RequestModel.create({
        profileId,
        editType,
        editObject: JSON.stringify(editObject),
        type,
        requiresHumanAction,
        isActive: true,
        userId,
    });
};
