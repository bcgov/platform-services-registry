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

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { getProvisionStatus } from '../src/libs/profile';

const p0 = path.join(__dirname, 'fixtures/select-profile.json');
const profile = JSON.parse(fs.readFileSync(p0, 'utf8'))[0];

const p1 = path.join(__dirname, 'fixtures/select-default-cluster.json');
const selectDefaultCluster = JSON.parse(fs.readFileSync(p1, 'utf8'));

const client = new Pool().connect();

describe('Profile services', () => {

  it('getProvisionStatus works correctly', async () => {

    const namespaces = [
      {
        id: 13,
        name: "4ea35c-tools",
        profileId: 4,
        archived: false,
        createdAt: "2020-05-06T21:16:42.799Z",
        updatedAt: "2020-05-06T21:16:42.799Z"
      },
      {
        id: 14,
        name: "4ea35c-test",
        profileId: 4,
        archived: false,
        createdAt: "2020-05-06T21:16:42.799Z",
        updatedAt: "2020-05-06T21:16:42.799Z"
      },
      {
        id: 15,
        name: "4ea35c-test",
        profileId: 4,
        archived: false,
        createdAt: "2020-05-06T21:16:42.799Z",
        updatedAt: "2020-05-06T21:16:42.799Z"
      }
    ];

    client.query.mockResolvedValue({ rows: namespaces });
    client.query.mockResolvedValue({ rows: selectDefaultCluster[0] });
    client.query.mockResolvedValue({ rows: [{ provisioned: true }] });
    client.query.mockResolvedValue({ rows: [{ provisioned: true }] });
    client.query.mockResolvedValue({ rows: [{ provisioned: true }] });
    client.query.mockResolvedValue({ rows: [{ provisioned: true }] });

    const result = await getProvisionStatus(profile);
    expect(result).toEqual(true);
  });
});
