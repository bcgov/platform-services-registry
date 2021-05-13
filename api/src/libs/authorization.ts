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
import { API_CLIENT_ID, BOT_CLIENT_ID, STATUS_ERROR, USER_ROLES, WEB_CLIENT_ID } from '../constants';
import DataManager from '../db';
import shared from '../libs/shared';

export const enum AccessFlag {
  ProvisionOnTestCluster = 'provision_on_test_clusters',
  EditAll = 'edit_all',
  ApproveRequests = 'approve_request',
  BotCallback = 'bot_callback',
}

export const AccessFlags = {};
AccessFlags[USER_ROLES.ADMINISTRATOR] = [
  AccessFlag.ProvisionOnTestCluster,
  AccessFlag.EditAll,
  AccessFlag.ApproveRequests,
];

AccessFlags[BOT_CLIENT_ID] = [AccessFlag.BotCallback];

AccessFlags[API_CLIENT_ID] = [
  ...AccessFlags[USER_ROLES.ADMINISTRATOR],
  ...AccessFlags[BOT_CLIENT_ID],
];

interface DecodedJwtPayloadAccessObj {
  roles: string[];
}

export const assignUserAccessFlags = (jwtPayload: any): AccessFlag[] | Error => {
  if (jwtPayload.clientId) {
    return AccessFlags[jwtPayload.clientId] ? AccessFlags[jwtPayload.clientId] : [];
  }

  if (jwtPayload.resource_access) {
    const decodedJwtPayloadAccessObj: DecodedJwtPayloadAccessObj | undefined =
      jwtPayload.resource_access[WEB_CLIENT_ID];

    if (!decodedJwtPayloadAccessObj) {
      return [];
    }
    const roles = decodedJwtPayloadAccessObj.roles;
    const nestedFlags = roles.map(role => AccessFlags[role]);

    // return flattened and de-duplicated flags
    return nestedFlags.reduce((a, b) => {
      return b.map((e, i) => { return a[i] instanceof Object ? a[i] : e; });
    }, []);
  }
  throw new Error();
};

const dm = new DataManager(shared.pgPool);
const { ProfileModel, ContactModel } = dm;
const unauthorizedMessage = STATUS_ERROR[401];

// TODO:(yh) sanitize profile id either here or somewhere else
export const authorizeByProfileIdAndUser = async (req): Promise<Error | void> => {
  const { params: { profileId }, user } = req;

  if (user.accessFlags.includes(AccessFlag.EditAll)) {
    return;
  }

  const projectDetails = await ProfileModel.findById(Number(profileId));
  if (user.id === projectDetails.userId) {
    return;
  }

  const projectContacts = await ContactModel.findForProject(Number(profileId));
  const authorizedEmails = projectContacts.map(contact => contact.email);
  if (authorizedEmails.includes(user.email)) {
    return;
  }

  throw new Error(unauthorizedMessage);
};

export const authorize = (): any[] => {
  return [
    (req, res, next) => {
      authorizeByProfileIdAndUser(req)
        .catch((err: Error) => {
          if (err.message === unauthorizedMessage) {
            next(errorWithCode(STATUS_ERROR[401], 401));
          } else {
            logger.error(`Unable to authorize, err = ${err.message}`);
            next(errorWithCode(STATUS_ERROR[500], 500));
          }
        })
        .then(() => next());
    },
  ];
};

export const authorizeByFlag = (accessFlag: AccessFlag) => {
  return [
    (req, res, next) => {
      const { user } = req;
      if (!user.accessFlags.includes(accessFlag)) {
        throw errorWithCode(STATUS_ERROR[401], 401);
      }
      next();
    },
  ];
};

// export const authorizeProvisionProfileNamespaces =
// (user: AuthenticatedUser, cluster: Cluster): Error | undefined => {
//   if (!(cluster.isProd || user.accessFlags.includes(AccessFlag.ProvisionOnTestCluster))) {
//     throw errorWithCode(STATUS_ERROR[401], 401);
//   }
//   return;
// };
