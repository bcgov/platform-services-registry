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
import { Response } from "express";
import DataManager from "../db";
import { AuthenticatedUser } from "../libs/authmware";
import { AccessFlag } from "../libs/authorization";
import shared from "../libs/shared";

const dm = new DataManager(shared.pgPool);

const fetchClusters = async (
  { user }: { user: AuthenticatedUser },
  res: Response
): Promise<void> => {
  const { ClusterModel } = dm;

  try {
    let results;
    if (user.accessFlags.includes(AccessFlag.ProvisionOnTestCluster)) {
      results = await ClusterModel.findAll();
    } else {
      results = await ClusterModel.findAllProdReady();
    }

    res.status(200).json(results);
  } catch (err) {
    const message = "Unable to fetch clusters";
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export default fetchClusters;
