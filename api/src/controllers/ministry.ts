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

import { errorWithCode, logger } from "@bcgov/common-nodejs-utils";
import { Request, Response } from "express";
import DataManager from "../db";
import shared from "../libs/shared";

const dm = new DataManager(shared.pgPool);

const fetchMinistrySponsors = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { MinistryModel } = dm;
  try {
    const results = await MinistryModel.findAll();

    res.status(200).json(results);
  } catch (err) {
    const message = "Unable fetch ministries";
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export default fetchMinistrySponsors;
