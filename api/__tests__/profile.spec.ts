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
import { camelCase } from 'lodash';
import path from 'path';
import { archiveProjectProfile, createProjectProfile, fetchAllProjectProfiles, fetchProjectProfile, uniqueNamespacePrefix, updateProjectProfile } from '../src/controllers/profile';

const p0 = path.join(__dirname, 'fixtures/select-profiles.json');
const selectProfiles = JSON.parse(fs.readFileSync(p0, 'utf8'));

const p1 = path.join(__dirname, 'fixtures/insert-profile.json');
const insertProfile = JSON.parse(fs.readFileSync(p1, 'utf8'));

const client = {
  query: jest.fn(),
  release: jest.fn(),
}

jest.mock('../src/db/utils', () => ({
  generateNamespacePrefix: jest.fn().mockReturnValue('c8c7e6'),
  transformKeysToCamelCase: jest.fn().mockImplementation(data => {
    const obj = {};
    Object.keys(data).forEach(key => {
      obj[camelCase(key)] = data[key];
    });

    return obj;
  }),
}));

jest.mock('pg', () => {
  return {
    Pool: jest.fn(() => {
      return {
        connect: jest.fn().mockImplementation(() => {
          return client;
        }),
        query: jest.fn(),
        end: jest.fn(),
      }
    }),
  };
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
    end: jest.fn(),
  }
  req: any;
  responseData: any;
}

describe('Profile event handlers', () => {
  let ex;

  beforeEach(() => {
    jest.clearAllMocks();
    // jest.resetAllMocks();

    ex = new FauxExpress();
  });

  it('A project is created', async () => {
    const req = {
      body: insertProfile,
      user: {
        id: 1,
      },
    };
    const addon = {
      id: 9,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });
    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });
    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });

    client.query.mockReturnValueOnce({ rows: [{ ...insertProfile, ...addon }] });

    // @ts-ignore
    await createProjectProfile(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot({
      // id: expect.any(Number),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('A project fails to create', async () => {
    const req = {
      body: insertProfile,
    };

    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(createProjectProfile(req, ex.res)).rejects.toThrow();

    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.json).not.toBeCalled();
  });


  it('All profiles are returned', async () => {
    const req = {};
    client.query.mockReturnValueOnce({ rows: selectProfiles });

    // @ts-ignore
    await fetchAllProjectProfiles(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('Fetch all profiles should throw', async () => {
    const req = {};
    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(fetchAllProjectProfiles(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it('A single profile is returned', async () => {
    const req = {
      params: { profileId: 1 },
    };
    client.query.mockReturnValueOnce({ rows: [selectProfiles[0]] });


    // @ts-ignore
    await fetchProjectProfile(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('Fetch single profile should throw', async () => {
    const req = {
      params: { profileId: 1 },
    };
    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(fetchProjectProfile(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it('A project is updated', async () => {
    const body = JSON.parse(JSON.stringify(insertProfile));
    const aBody = {
      ...body,
      id: 9,
      createdAt: '2020-05-19T20:02:54.561Z',
      updateAt: '2020-05-19T20:02:54.561Z',
    };
    const req = {
      params: { profileId: 1 },
      body,
      user: {
        id: 1,
      },
    }

    client.query.mockReturnValue({ rows: [aBody] });

    // @ts-ignore
    await updateProjectProfile(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('A project fails to update', async () => {
    const body = JSON.parse(JSON.stringify(insertProfile));
    const aBody = {
      id: 9,
      ...body,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const req = {
      params: { profileId: 1 },
      body: aBody,
      user: {
        id: 1,
      }
    }

    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(updateProjectProfile(req, ex.res)).rejects.toThrow();

    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.json).not.toBeCalled();
  });

  it('A project is archived', async () => {
    const aBody = {
      id: 9,
      ...insertProfile,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const req = {
      params: { profileId: 9 },
    }

    client.query.mockReturnValueOnce({ rows: [aBody] });

    // @ts-ignore
    await archiveProjectProfile(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.json).not.toBeCalled();
    expect(ex.res.end).toBeCalled();
  });

  it('A project fails to archive', async () => {
    const req = {
      params: { profileId: 9 },
    }

    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(archiveProjectProfile(req, ex.res)).rejects.toThrow();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.res.json).not.toBeCalled();
    expect(ex.res.end).not.toBeCalled();
  });


  it('Unique profile names are derived', async () => {
    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });
    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });
    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });

    const result = await uniqueNamespacePrefix();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });
});
