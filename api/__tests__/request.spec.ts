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

import fs from "fs";
import path from "path";
import { updateRequestHumanAction } from "../src/controllers/request";
import { AccessFlag } from "../src/libs/authorization";
import FauxExpress from "./src/fauxexpress";

const p4 = path.join(__dirname, "fixtures/get-authenticated-user.json");
const authenticatedUser = JSON.parse(fs.readFileSync(p4, "utf8"));

const body = [
  {
    id: 1,
    firstName: "JaneTEST",
    lastName: "DoeTEST",
    email: "jane@example.com",
    githubId: "jane1100",
    roleId: 1,
  },
  {
    id: 2,
    firstName: "JohnTEST",
    lastName: "DoeTEST",
    email: "john@example.com",
    githubId: "john1100",
    roleId: 2,
  },
];

describe("Request event handlers", () => {
  let ex;

  beforeEach(() => {
    jest.clearAllMocks();

    ex = new FauxExpress();
  });

  it("updateRequestHumanAction throws unauthorized error for read all flag", async () => {
    const req = {
      params: { profileId: 4 },
      body,
      user: {
        ...authenticatedUser,
        accessFlags: [AccessFlag.ReadAll],
      },
    };

    await expect(updateRequestHumanAction(req, ex.res)).rejects.toThrow(
      "unauthorized"
    );
  });

  it("updateRequestHumanAction throws unauthorized error for no flags", async () => {
    const req = {
      params: { profileId: 4 },
      body,
      user: {
        ...authenticatedUser,
        accessFlags: [],
      },
    };

    await expect(updateRequestHumanAction(req, ex.res)).rejects.toThrow(
      "unauthorized"
    );
  });
});
