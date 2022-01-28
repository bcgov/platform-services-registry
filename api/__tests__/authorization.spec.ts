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

import { NextFunction } from "express";
import fs from "fs";
import path from "path";
import { BOT_CLIENT_ID, STATUS_ERROR, USER_ROLES } from "../src/constants";
import {
  AccessFlag,
  AccessFlags,
  assignUserAccessFlags,
  authorizeByFlag,
} from "../src/libs/authorization";
import FauxExpress from "./src/fauxexpress";

const p0 = path.join(__dirname, "fixtures/get-authenticated-user.json");
const authenticatedUser = JSON.parse(fs.readFileSync(p0, "utf8"));

const p1 = path.join(__dirname, "fixtures/get-jwt-payload-user.json");
const jwtPayloadUser = JSON.parse(fs.readFileSync(p1, "utf8"));

const p2 = path.join(__dirname, "fixtures/get-jwt-payload-sa.json");
const jwtPayloadServiceAccount = JSON.parse(fs.readFileSync(p2, "utf8"));

describe("Authorization services", () => {
  let ex;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    ex = new FauxExpress();
  });

  it("assignUserAccessFlags should return empty flags to authorized user with no role", async () => {
    expect(assignUserAccessFlags(jwtPayloadUser)).toEqual([]);
  });

  it("assignUserAccessFlags should return flags to authorized user with admin role", async () => {
    const flags = AccessFlags[USER_ROLES.ADMINISTRATOR];
    const resourceAccessObj = {
      "registry-web": {
        roles: [USER_ROLES.ADMINISTRATOR],
      },
    };

    const jwtPayloadUserWithAdminRole = {
      ...jwtPayloadUser,
      resource_access: resourceAccessObj,
    };
    expect(assignUserAccessFlags(jwtPayloadUserWithAdminRole)).toEqual(flags);
  });

  it("assignUserAccessFlags should return flags to authorized user with read only admin role", async () => {
    const flags = AccessFlags[USER_ROLES.READ_ONLY_ADMINISTRATOR];
    const resourceAccessObj = {
      "registry-web": {
        roles: [USER_ROLES.READ_ONLY_ADMINISTRATOR],
      },
    };

    const jwtPayloadUserWithAdminRole = {
      ...jwtPayloadUser,
      resource_access: resourceAccessObj,
    };
    expect(assignUserAccessFlags(jwtPayloadUserWithAdminRole)).toEqual(flags);
  });

  it("assignUserAccessFlags should return flags to authorized bot service account", async () => {
    const flags = AccessFlags[BOT_CLIENT_ID];

    expect(assignUserAccessFlags(jwtPayloadServiceAccount)).toEqual(flags);
  });

  it("authorizeByFlag should grant access to authorized user", async () => {
    const accessFlag = AccessFlag.EditAll;
    const req = {
      user: { ...authenticatedUser, accessFlags: [accessFlag] },
    };

    const authorizeByFlagMiddleware = authorizeByFlag(accessFlag)[0];

    authorizeByFlagMiddleware(req, ex.res, nextFunction);
    expect(nextFunction).toBeCalledTimes(1);
  });

  it("authorizeByFlag should deny access to not authorized user", async () => {
    const accessFlag = AccessFlag.EditAll;
    const req = {
      user: authenticatedUser,
    };

    const authorizeByFlagMiddleware = authorizeByFlag(accessFlag)[0];

    expect(() => {
      authorizeByFlagMiddleware(req, ex.res, nextFunction);
    }).toThrow(STATUS_ERROR[401]);
  });
});
