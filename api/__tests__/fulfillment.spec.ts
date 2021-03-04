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
import { RequestEditType } from '../src/db/model/request';
import { contextForProvisioning, fulfillEditRequest, FulfillmentContextAction, fulfillNamespaceProvisioning } from '../src/libs/fulfillment';

const p1 = path.join(__dirname, 'fixtures/select-profile.json');
const profile = JSON.parse(fs.readFileSync(p1, 'utf8'));

const p2 = path.join(__dirname, 'fixtures/select-profile-contacts.json');
const contacts = JSON.parse(fs.readFileSync(p2, 'utf8'));

const p3 = path.join(__dirname, 'fixtures/select-profile-namespaces.json');
const namespaces = JSON.parse(fs.readFileSync(p3, 'utf8'));

const p4 = path.join(__dirname, 'fixtures/select-quota-small.json');
const quotas = JSON.parse(fs.readFileSync(p4, 'utf8'));
const spec = quotas[0].jsonBuildObject;

jest.mock('../src/libs/profile', () => {
  return {
    getProfileCurrentQuotaSize: jest.fn().mockResolvedValue('small'),
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
    client.query.mockReturnValueOnce({ rows: namespaces });
    const result = await contextForProvisioning(12345, FulfillmentContextAction.Create);

    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
  });

  it('Provisioning context is not created (no contacts)', async () => {

    client.query.mockReturnValueOnce({ rows: profile });
    client.query.mockReturnValueOnce({ rows: [] });
    client.query.mockReturnValueOnce({ rows: quotas });
    client.query.mockReturnValueOnce({ rows: namespaces });

    const result = await contextForProvisioning(12345, FulfillmentContextAction.Create);

    expect(result).not.toBeDefined();
  });

  it('Provisioning context is not created (query fails)', async () => {

    client.query.mockImplementation(() => { throw new Error() });

    await expect(contextForProvisioning(12345, FulfillmentContextAction.Create)).rejects.toThrow();
  });

  it('Namespace provisioning succeeds', async () => {

    client.query.mockReturnValueOnce({ rows: profile });
    client.query.mockReturnValueOnce({ rows: contacts });
    client.query.mockReturnValueOnce({ rows: quotas });
    client.query.mockReturnValueOnce({ rows: namespaces });

    await expect(fulfillNamespaceProvisioning(12345)).resolves.toBeUndefined();
  });

  it('Namespace provisioning fails', async () => {

    client.query.mockReturnValueOnce({ rows: profile });
    client.query.mockReturnValueOnce({ rows: [] });
    client.query.mockReturnValueOnce({ rows: quotas });
    client.query.mockReturnValueOnce({ rows: namespaces });

    await expect(fulfillNamespaceProvisioning(12345)).rejects.toThrow();
  });

  it('Provisioned namespaces updated succeeds', async () => {
    const requestEditObject = {
      quota: 'small',
      quotas: spec,
    };
    const requestEditType = RequestEditType.QuotaSize;

    client.query.mockReturnValueOnce({ rows: profile });
    client.query.mockReturnValueOnce({ rows: contacts });
    client.query.mockReturnValueOnce({ rows: quotas });
    client.query.mockReturnValueOnce({ rows: namespaces });

    await expect(fulfillEditRequest(12345, requestEditType, requestEditObject)).resolves.toBeDefined();
  });
});
