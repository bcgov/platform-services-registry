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
import { RequestType } from '../db/model/request';
import { AuthenticatedUser } from '../libs/authmware';
import shared from '../libs/shared';

const dm = new DataManager(shared.pgPool);

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
      requiresHumanAction: true,
      isActive: true,
      userId: user.id,
    });

    res.status(204).end();
  } catch (err) {
    const message = `Unable to update profile`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};