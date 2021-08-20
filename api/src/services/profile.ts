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
import { ROLE_IDS } from '../constants';
import DataManager from '../db';
import { AccessFlag } from '../libs/authorization';
import { getClusters, getQuotaSize } from '../libs/profile';
import shared from '../libs/shared';

const dm = new DataManager(shared.pgPool);

const { ProfileModel, ContactModel } = dm;

export const fetchAllDashboardProjects = async (userDetails: any): Promise<any> => {
  try {
    let profiles;
    if (userDetails.accessFlags.includes(AccessFlag.EditAll)) {
      profiles = await ProfileModel.fetchAllDashboardProjects();
    } else {
      profiles = await ProfileModel.findProfilesByUserIdOrEmail(userDetails.id, userDetails.email);
    }

    const extractName = ({displayName}) => {
      return displayName;
    }

    for (const profile of profiles) {
      const clusters = await getClusters(profile);
      profile.clusters = clusters.map(cluster => extractName(cluster));
      profile.quotaSize = await getQuotaSize(profile);

      if (!userDetails.accessFlags.includes(AccessFlag.EditAll)) {
        const contacts = await ContactModel.findForProject(Number(profile.id));
        profile.productOwners = contacts.filter(contact => contact.roleId === ROLE_IDS.PRODUCT_OWNER);
        profile.technicalLeads = contacts.filter(contact => contact.roleId === ROLE_IDS.TECHNICAL_CONTACT);
        profile.profileMetadata = await ProfileModel.findProfileMetadata(Number(profile.id));
      }
    }

    return profiles;
  } catch (err) {
    const message = `Unable to get projects for dashboard`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};
