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
// Created by Jason Leach on 2020-06-15.
//

'use strict';

import { errorWithCode, logger } from '@bcgov/common-nodejs-utils';
import { Response } from 'express';
import DataManager from '../db';
import shared from '../libs/shared';

const dm = new DataManager(shared.pgPool);
//TODO: Create new ministry api
// export const createMinistry = async (
//   { params, body }: { params: any, body: any }, res: Response
// ): Promise<void> => {
//   const { MinistryModel } = dm;
//   const { profileId } = params;
//   const aBody = { ...body, profileId };

//   const rv = validateObjProps(MinistryModel.requiredFields, aBody);
//   if (rv) {
//     throw rv;
//   }

//   try {
//     const results = await MinistryModel.create(aBody);

//     res.status(201).json(results);
//   } catch (err) {
//     const message = 'Unable create new ministry';
//     logger.error(`${message}, err = ${err.message}`);

//     throw errorWithCode(message, 500);
//   }
// };

export const fetchMinistrySponsors = async (
  { headers, params }: { headers: any, params: any }, res: Response
): Promise<void> => {
  const { MinistryModel } = dm;
  // const { profileId } = params;
  // console.log(headers);
  try {
    const results = await MinistryModel.findAllMinistries();


    // const results = [
    //   {
    //     name: 'Citizens\s Services',
    //     code: 'CITZ',
    //   },
    //   {
    //     name: 'Transportation & Infrastructure',
    //     code: 'TRAN',
    //   },
    // ]
    res.status(200).json(results);
  } catch (err) {
    const message = `Unable fetch ministries`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};
