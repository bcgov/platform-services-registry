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
import {
  API_CLIENT_ID,
  BOT_CLIENT_ID,
  STATUS_ERROR,
  USER_ROLES,
  WEB_CLIENT_ID,
} from "../constants";
import DataManager from "../db";
import shared from "./shared";

export const enum AccessFlag {
  ProvisionOnTestCluster = "provision_on_test_clusters",
  EditAll = "edit_all",
  ApproveRequests = "approve_request",
  BotCallback = "bot_callback",
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

export const assignUserAccessFlags = (
  jwtPayload: any
): AccessFlag[] | Error => {
  if (jwtPayload.clientId) {
    return AccessFlags[jwtPayload.clientId]
      ? AccessFlags[jwtPayload.clientId]
      : [];
  }

  if (jwtPayload.resource_access) {
    const decodedJwtPayloadAccessObj: DecodedJwtPayloadAccessObj | undefined =
      jwtPayload.resource_access[WEB_CLIENT_ID];

    if (!decodedJwtPayloadAccessObj) {
      return [];
    }
    const { roles } = decodedJwtPayloadAccessObj;
    const nestedFlags = roles.map((role) => AccessFlags[role]);

    // return flattened and de-duplicated flags
    return nestedFlags.reduce(
      (a, b) => b.map((e, i) => (a[i] instanceof Object ? a[i] : e)),
      []
    );
  }
  throw new Error();
};

export const authorize = (asyncFn): any[] => [
  (req, res, next) => {
    asyncFn(req)
      .catch((err: Error) => {
        if (err.message === STATUS_ERROR[401]) {
          next(err);
        } else {
          const message = "Unable to authorize";
          logger.error(`${message}, err = ${err.message}`);

          next(errorWithCode(message, 500));
        }
      })
      .then(() => next());
  },
];

export const authorizeByFlag = (accessFlag: AccessFlag) => [
  (req, res, next) => {
    const { user } = req;
    if (!user.accessFlags.includes(accessFlag)) {
      throw errorWithCode(STATUS_ERROR[401], 401);
    }
    next();
  },
];

const dm = new DataManager(shared.pgPool);
const { ProfileModel, ContactModel, ClusterModel } = dm;

export const validateRequiredProfile = async (req): Promise<Error | void> => {
  const {
    params: { profileId },
    user,
  } = req;

  if (user.accessFlags.includes(AccessFlag.EditAll)) {
    return;
  }

  const projectDetails = await ProfileModel.findById(Number(profileId));
  if (user.id === projectDetails.userId) {
    return;
  }

  const projectContacts = await ContactModel.findForProject(Number(profileId));
  const authorizedEmails = projectContacts.map((contact) => contact.email);
  if (authorizedEmails.includes(user.email)) {
    return;
  }

  throw errorWithCode(STATUS_ERROR[401], 401);
};

export const validateRequiredCluster = async (req): Promise<Error | void> => {
  const {
    body: { primaryClusterName },
    user,
  } = req;

  if (primaryClusterName !== undefined) {
    const cluster = await ClusterModel.findByName(primaryClusterName);

    if (
      cluster &&
      !(
        cluster.isProd ||
        user.accessFlags.includes(AccessFlag.ProvisionOnTestCluster)
      )
    ) {
      throw errorWithCode(STATUS_ERROR[401], 401);
    }
  }
};
