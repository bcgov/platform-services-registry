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

import { NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { AccessFlag, authorizeByFlag } from '../src/libs/authorization';
import FauxExpress from './src/fauxexpress';

const p5 = path.join(__dirname, 'fixtures/get-authenticated-user.json');
const AuthenticatedUser = JSON.parse(fs.readFileSync(p5, 'utf8'));

describe('Authorization services', () => {
  let accessFlag = AccessFlag.EditAll;
  let ex;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    ex = new FauxExpress();
  });

  it('authorizeByFlag() should grant access to authorized user', async () => {
    const req = {
      user: { ...AuthenticatedUser, accessFlags: [accessFlag] },
    };

    const authorizeByFlagMiddleware = authorizeByFlag(accessFlag)[0];

    authorizeByFlagMiddleware(req, ex.res, nextFunction);
    expect(nextFunction).toBeCalledTimes(1);
  });
});
