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
import { AccessFlag } from '../libs/authorization';
import { getClusters, getQuotaSize } from '../libs/profile';
import shared from '../libs/shared';

const dm = new DataManager(shared.pgPool);

const { ProfileModel } = dm;

export const fetchAllDashboardProjects = async (accessFlags: any): Promise<any> => {
  try {
    let results;
    if (accessFlags.includes(AccessFlag.EditAll)) {
      results = await ProfileModel.fetchAllDashboardProjects();
    } else {
      results = await ProfileModel.fetchAllDashboardProjects();
    }

    const { profiles } = results;

    const extractName = ({displayName}) => {
      return displayName;
    }

    for (const profile of profiles) {
      const clusters = await getClusters(profile);
      profile.clusters = clusters.map(cluster => extractName(cluster))
      profile.quotaSize = await getQuotaSize(profile);
    }

    return results;
  } catch (err) {
    const message = `Unable to get projects for dashboard`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};
