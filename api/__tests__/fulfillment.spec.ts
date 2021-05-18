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
import { QuotaSize } from '../src/db/model/quota';
import { RequestEditType } from '../src/db/model/request';
import { contextForProvisioning, fulfillEditRequest, fulfillNamespaceProvisioning } from '../src/libs/fulfillment';

const p1 = path.join(__dirname, 'fixtures/select-profile.json');
const profile = JSON.parse(fs.readFileSync(p1, 'utf8'));

const p2 = path.join(__dirname, 'fixtures/select-profile-contacts.json');
const contacts = JSON.parse(fs.readFileSync(p2, 'utf8'));

const p3 = path.join(__dirname, 'fixtures/select-project-set-namespaces.json');
const profileClusterNamespaces = JSON.parse(fs.readFileSync(p3, 'utf8'));

const p4 = path.join(__dirname, 'fixtures/select-quota-small.json');
const quotas = JSON.parse(fs.readFileSync(p4, 'utf8'));
const spec = quotas[0].jsonBuildObject;

jest.mock('../src/libs/profile', () => {
  return {
    getQuotaSize: jest.fn().mockResolvedValue(QuotaSize.Small),
  };
});

describe('Services', () => {

  const client = new Pool().connect();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Provisioning context is created', async () => {

    client.query.mockReturnValueOnce({ rows: profile });
    client.query.mockReturnValueOnce({ rows: contacts });
    client.query.mockReturnValueOnce({ rows: quotas });
    client.query.mockReturnValueOnce({ rows: profileClusterNamespaces });
    const result = await contextForProvisioning(12345, false);

    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
  });

  it('Provisioning context is not created (no contacts)', async () => {

    client.query.mockReturnValueOnce({ rows: profile });
    client.query.mockReturnValueOnce({ rows: [] });
    client.query.mockReturnValueOnce({ rows: quotas });
    client.query.mockReturnValueOnce({ rows: profileClusterNamespaces });

    await expect(contextForProvisioning(12345, false)).rejects.toThrow();
  });

  it('Provisioning context is not created (query fails)', async () => {

    client.query.mockImplementation(() => { throw new Error() });

    await expect(contextForProvisioning(12345, false)).rejects.toThrow();
  });

  it('Namespace provisioning succeeds', async () => {
    client.query.mockReturnValueOnce({ rows: profile });

    client.query.mockReturnValueOnce({ rows: profile });
    client.query.mockReturnValueOnce({ rows: contacts });
    client.query.mockReturnValueOnce({ rows: quotas });
    client.query.mockReturnValueOnce({ rows: profileClusterNamespaces });

    await expect(fulfillNamespaceProvisioning(12345)).resolves.toBeUndefined();
  });

  it('Namespace edit request succeeds', async () => {
    const requestEditObject = {
      quota: QuotaSize.Small,
      quotas: spec,
    };
    const requestEditType = RequestEditType.QuotaSize;
    client.query.mockReturnValueOnce({ rows: profile });

    client.query.mockReturnValueOnce({ rows: profile });
    client.query.mockReturnValueOnce({ rows: contacts });
    client.query.mockReturnValueOnce({ rows: quotas });
    client.query.mockReturnValueOnce({ rows: profileClusterNamespaces });

    await expect(fulfillEditRequest(12345, requestEditType, requestEditObject)).resolves.toBeDefined();
  });
});
