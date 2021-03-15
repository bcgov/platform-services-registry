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

import fs from 'fs';
import path from 'path';
import ClusterModel from '../src/db/model/cluster';
import { isNamespaceSetProvisioned } from '../src/libs/namespace-set';
import { isProfileProvisioned } from '../src/libs/profile';

const p0 = path.join(__dirname, 'fixtures/select-profile.json');
const profile = JSON.parse(fs.readFileSync(p0, 'utf8'))[0];

const p1 = path.join(__dirname, 'fixtures/select-default-cluster.json');
const selectDefaultCluster = JSON.parse(fs.readFileSync(p1, 'utf8'));

jest.mock('../src/libs/namespace-set', () => ({
  isNamespaceSetProvisioned: jest.fn(),
}));

describe('Profile services', () => {

  it('isProfileProvisioned works correctly', async () => {
    const findByName = ClusterModel.prototype.findByName = jest.fn().mockResolvedValue(selectDefaultCluster);

    await isProfileProvisioned(profile);
    expect(findByName).toHaveBeenCalledTimes(1);
    expect(isNamespaceSetProvisioned).toHaveBeenCalledWith(profile, selectDefaultCluster);
  });
});
