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
import { getAllProfileIdsUnderPending, getAllProvisionedProfileIds, getProfileBotJsonUnderPending, getProvisionedProfileBotJson } from '../src/controllers/sync';
import FauxExpress from './src/fauxexpress';

const p0 = path.join(__dirname, 'fixtures/select-profile.json');
const selectProfile = JSON.parse(fs.readFileSync(p0, 'utf8'));

const p1 = path.join(__dirname, 'fixtures/select-request.json');
const selectRequest = JSON.parse(fs.readFileSync(p1, 'utf8'));

const client = new Pool().connect();

jest.mock('../src/libs/profile', () => {
  const p2 = path.join(__dirname, 'fixtures/select-default-cluster.json');
  const selectDefaultCluster = JSON.parse(fs.readFileSync(p2, 'utf8'));

  return {
    isProfileProvisioned: jest.fn().mockReturnValue(true),
    getDefaultCluster: jest.fn().mockReturnValue(selectDefaultCluster),
  };
});

jest.mock('../src/libs/fulfillment', () => {
  const p3 = path.join(__dirname, 'fixtures/provisioning-context.json');
  const selectProvisioningContext = JSON.parse(fs.readFileSync(p3, 'utf8'));

  return {
    contextForProvisioning: jest.fn().mockReturnValue(selectProvisioningContext),
  };
});

jest.mock('../src/libs/utils', () => {
  return {
    replaceForDescription: jest.fn().mockReturnValue(''),
  };
});

describe('Sync event handlers', () => {
  let ex;

  beforeEach(() => {
    jest.clearAllMocks();
    ex = new FauxExpress();
  });

  it('All provisioned profile ids are returned', async () => {
    const req = {};
    client.query.mockReturnValueOnce({ rows: selectProfile });

    // @ts-ignore
    await getAllProvisionedProfileIds(req, ex.res);

    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('Fetch all provisioned profile ids should throw', async () => {
    const req = {
      params: {},
    };
    client.query.mockImplementation(() => { throw new Error() });

    await expect(getAllProvisionedProfileIds(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(ex.responseData).toBeUndefined();
  });

  it('Bot json object for a queried provisioned profile is returned', async () => {
    const req = {
      params: {
        profileId: 1,
      },
    };
    client.query.mockReturnValueOnce({ rows: selectProfile });

    // @ts-ignore
    await getProvisionedProfileBotJson(req, ex.res);

    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('Bot json object for a queried provisioned profile should throw', async () => {
    const req = {
      params: { profileId: 1 },
    };
    client.query.mockImplementation(() => { throw new Error() });

    await expect(getProvisionedProfileBotJson(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(ex.responseData).toBeUndefined();
  });

  it('All ids of profiles under pending edit / create are returned', async () => {
    const req = {};
    client.query.mockReturnValueOnce({ rows: selectRequest });
    client.query.mockReturnValueOnce({ rows: selectProfile });

    // @ts-ignore
    await getAllProfileIdsUnderPending(req, ex.res);

    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('Fetch all ids of profiles under pending edit / create should throw', async () => {
    const req = {
      params: {},
    };
    client.query.mockImplementation(() => { throw new Error() });

    await expect(getAllProfileIdsUnderPending(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(ex.responseData).toBeUndefined();
  });

  it('Bot json object for a queried profile under pending edit / create is returned', async () => {
    jest.mock('../src/libs/profile', () => {
      const p2 = path.join(__dirname, 'fixtures/select-default-cluster.json');
      const selectDefaultCluster = JSON.parse(fs.readFileSync(p2, 'utf8'));

      return {
        isProfileProvisioned: jest.fn().mockReturnValue(false),
        getDefaultCluster: jest.fn().mockReturnValue(selectDefaultCluster),
      };
    });

    const req = {
      params: { profileId: 118 },
    };
    client.query.mockReturnValueOnce({ rows: selectRequest });
    client.query.mockReturnValueOnce({ rows: selectProfile });
    client.query.mockReturnValueOnce({ rows: [] });

    // @ts-ignore
    await getProfileBotJsonUnderPending(req, ex.res);

    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('Fetch all ids of profiles under pending edit / create should throw', async () => {
    const req = {
      params: {},
    };
    client.query.mockImplementation(() => { throw new Error() });

    await expect(getAllProfileIdsUnderPending(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(ex.responseData).toBeUndefined();
  });
});