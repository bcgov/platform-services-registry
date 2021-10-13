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
import { camelCase } from "lodash";
import path from "path";
import { Pool } from "pg";
import fetchMinistrySponsors from "../src/controllers/ministry";
import FauxExpress from "./src/fauxexpress";

const p0 = path.join(__dirname, "fixtures/select-ministry-sponsors.json");
const selectMinistrySponsors = JSON.parse(fs.readFileSync(p0, "utf8"));

const client = new Pool().connect();

jest.mock("../src/db/utils", () => ({
  generateNamespacePrefix: jest.fn().mockReturnValue("c8c7e6"),
  transformKeysToCamelCase: jest.fn().mockImplementation((data) => {
    const obj = {};
    Object.keys(data).forEach((key) => {
      obj[camelCase(key)] = data[key];
    });

    return obj;
  }),
}));

describe("Ministry event handlers", () => {
  let ex;

  beforeEach(() => {
    jest.clearAllMocks();

    ex = new FauxExpress();
  });

  it("All ministry sponsors are returned", async () => {
    const req = {};
    client.query.mockReturnValueOnce({ rows: selectMinistrySponsors });

    // @ts-ignore
    await fetchMinistrySponsors(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it("Fetch all profiles should throw", async () => {
    const req = {};
    client.query.mockImplementation(() => {
      throw new Error();
    });

    await expect(
      // @ts-ignore
      fetchMinistrySponsors(req, ex.res)
    ).rejects.toThrowErrorMatchingSnapshot();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });
});
