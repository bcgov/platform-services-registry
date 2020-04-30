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

import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fetchAllProjectProfiles } from '../src/libs/profile';

const p0 = path.join(__dirname, 'fixtures/select-profiles.json');
const selectProfiles = JSON.parse(fs.readFileSync(p0, 'utf8'));

const pmock = {
  connect: jest.fn(),
  query: jest.fn().mockReturnValue({ rows: selectProfiles }),
  end: jest.fn(),
};

jest.mock('pg', () => {
  return { Pool: jest.fn(() => pmock) };
});

class FauxExpress {
  res: Partial<Response> = {
    clearCookie: jest.fn(),
    cookie: jest.fn(),
    json: jest.fn().mockImplementation((param) => {
      this.responseData = param;
      return this.res;
    }),
    status: jest.fn().mockImplementation((code) => {
      this.res.statusCode = code;
      return this.res;
    }),
    statusCode: 200,
  }
  req: any;
  responseData: any;
}


describe('Profile event handlers', () => {
  const ex = new FauxExpress();

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('All profiles are returned', async () => {
    // const req = {
    //   params: { profileId: 3 },
    // };
    const req = {};

    // @ts-ignore
    await fetchAllProjectProfiles(req, ex.res);

    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });
});
