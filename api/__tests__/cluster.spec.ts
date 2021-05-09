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
import { fetchClusters } from '../src/controllers/cluster';
import ClusterModel from '../src/db/model/cluster';
import { AccessFlag } from '../src/libs/authorization';
import FauxExpress from './src/fauxexpress';

const p0 = path.join(__dirname, 'fixtures/select-default-cluster.json');
const selectCluster = JSON.parse(fs.readFileSync(p0, 'utf8'));

const p1 = path.join(__dirname, 'fixtures/get-authenticated-user.json');
const authenticatedUser = JSON.parse(fs.readFileSync(p1, 'utf8'));

const client = new Pool().connect();

describe('Project-profile event handlers', () => {
  let ex;

  beforeEach(() => {
    jest.clearAllMocks();

    ex = new FauxExpress();
  });


  it('All clusters are returned', async () => {
    const req = {
      user: { ...authenticatedUser, accessFlags: [AccessFlag.ProvisionOnTestCluster,] },
    };
    client.query.mockReturnValueOnce({ rows: selectCluster });

    // @ts-ignore
    await fetchClusters(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('Fetch all clusters should throw', async () => {
    const req = {};
    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(fetchClusters(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it('Prod-ready clusters are returned to non-authorized user', async () => {
    const findAllProdReady = ClusterModel.prototype.findAllProdReady = jest.fn().mockResolvedValue({ rows: ['stub'] });
    const req = {
      user: authenticatedUser,
    };

    // @ts-ignore
    await fetchClusters(req, ex.res);
    expect(findAllProdReady).toHaveBeenCalledTimes(1);
  });

  it('Both test and prod-ready clusters are returned to authorized user', async () => {
    const findAll = ClusterModel.prototype.findAll = jest.fn().mockResolvedValue({ rows: ['stub'] });
    const req = {
      user: { ...authenticatedUser, accessFlags: [AccessFlag.ProvisionOnTestCluster,] },
    };

    // @ts-ignore
    await fetchClusters(req, ex.res);
    expect(findAll).toHaveBeenCalledTimes(1);
  });
});
