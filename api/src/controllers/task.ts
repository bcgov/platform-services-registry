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
import { Request } from '../db/model/request';
import { getProfileCurrentQuotaSize } from '../libs/profile';
import shared from '../libs/shared';

const dm = new DataManager(shared.pgPool);

// TODO:(yh) fix this work-around for pending edit request
// how edit request data are stored in db should be independent
// from the bot json structure registry api and bot use for communication
export const migratePendingEditRequests = async (
  { params }: { params: any }, res: Response
): Promise<void> => {
  const { RequestModel } = dm;

  try {
    // find all pending edit requests that need migration
    const requests = await RequestModel.findAll();
    const filtered = requests.filter((request: Request) => {
      if (!request.natsContext) {
        throw new Error('Unable to get natsContext');
      }
      const context = JSON.parse(request?.natsContext);
      return !context.hasOwnProperty('quota');
    });

    // process each migration
    const updatePromises: Promise<void>[] = [];
    filtered.forEach((request: Request) => {
      updatePromises.push(migrateProfileBotJsonUnderPendingEdit(request));
    });
    await Promise.all(updatePromises);

    res.status(204).end();
  } catch (err) {
    const message = `Unable to migrate pending edit bot json`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

const migrateProfileBotJsonUnderPendingEdit = async (request: Request): Promise<void> => {
  const { ProfileModel, QuotaModel, NamespaceModel, RequestModel } = dm;

  try {
    if (!request.natsContext) {
      throw new Error('Unable to get natsContext');
    }

    const obsoleteContext = JSON.parse(request.natsContext);

    let quotaSize;
    // @ts-expect-error
    if (request.editType === 'namespaces') {
      quotaSize = obsoleteContext.namespaces[0].clusters[0].quotas.cpu;
    } else {
      const profile = await ProfileModel.findById(request.profileId);
      quotaSize = await getProfileCurrentQuotaSize(profile);
    }
    const quotas = await QuotaModel.findForQuotaSize(quotaSize);
    const namespaces = await NamespaceModel.findForProfile(request.profileId);

    const { action, type, profileId, displayName, description, technicalContact, productOwner } = obsoleteContext;
    const newContext = {
      action,
      type,
      profileId,
      displayName,
      newDisplayName: 'NULL',
      description,
      quota: quotaSize,
      quotas,
      namespaces,
      technicalContact,
      productOwner,
    };
    // @ts-ignore
    const newRequest = await RequestModel.update(request.id, { natsContext: JSON.stringify(newContext) });
    logger.info(`successfully updated: ${JSON.stringify(request)} to ${JSON.stringify(newRequest)}`);
    return;
  } catch (err) {
    const message = `Unable to migrate request ${request.id}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};
