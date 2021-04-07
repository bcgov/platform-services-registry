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
import { Pool } from 'pg';
import { isNamespaceSetProvisioned } from '../src/libs/namespace-set';

const p0 = path.join(__dirname, 'fixtures/select-profile.json');
const profile = JSON.parse(fs.readFileSync(p0, 'utf8'));

const p1 = path.join(__dirname, 'fixtures/select-default-cluster.json');
const defaultCluster = JSON.parse(fs.readFileSync(p1, 'utf8'));

const p2 = path.join(__dirname, 'fixtures/select-namespace.json');
const selectNamespace = JSON.parse(fs.readFileSync(p2, 'utf8'));

const p3 = path.join(__dirname, 'fixtures/select-profile-namespaces.json');
const profileNamespaces = JSON.parse(fs.readFileSync(p3, 'utf8'));

const client = new Pool().connect();

describe('Namespace-set services', () => {

  it('isNamespaceSetProvisioned works correctly on the pending set', async () => {
    client.query.mockReturnValueOnce({ rows: selectNamespace });
    client.query.mockReturnValueOnce({ rows: [profileNamespaces[0].clusters[0]] });
    client.query.mockReturnValueOnce({ rows: [profileNamespaces[1].clusters[0]] });
    client.query.mockReturnValueOnce({ rows: [profileNamespaces[2].clusters[0]] });
    client.query.mockReturnValueOnce({ rows: [profileNamespaces[3].clusters[0]] });

    const results = await isNamespaceSetProvisioned(profile, defaultCluster)

    expect(results).toEqual(false);
  });

  it('isNamespaceSetProvisioned works correctly on the provisioned set', async () => {
    client.query.mockReturnValueOnce({ rows: selectNamespace });
    client.query.mockReturnValueOnce({ rows: [{ ...profileNamespaces[0].clusters[0], provisioned: true }] });
    client.query.mockReturnValueOnce({ rows: [{ ...profileNamespaces[1].clusters[0], provisioned: true }] });
    client.query.mockReturnValueOnce({ rows: [{ ...profileNamespaces[2].clusters[0], provisioned: true }] });
    client.query.mockReturnValueOnce({ rows: [{ ...profileNamespaces[3].clusters[0], provisioned: true }] });

    const results = await isNamespaceSetProvisioned(profile, defaultCluster)

    expect(results).toEqual(true);
  });

  it('replaceForDescription should throw on inconsistent set', async () => {
    client.query.mockReturnValueOnce({ rows: selectNamespace });
    client.query.mockReturnValueOnce({ rows: [{ ...profileNamespaces[0].clusters[0], provisioned: true }] });
    client.query.mockReturnValueOnce({ rows: [{ ...profileNamespaces[1].clusters[0], provisioned: true }] });
    client.query.mockReturnValueOnce({ rows: [profileNamespaces[2].clusters[0]] });
    client.query.mockReturnValueOnce({ rows: [profileNamespaces[3].clusters[0]] });

    await expect(isNamespaceSetProvisioned(profile, defaultCluster))
      .rejects
      .toThrow(`Need to fix entries as the provisioning status of
      namespace set is not consistent`);
  });
});
