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
import { camelCase } from 'lodash';
import path from 'path';
import { Pool } from 'pg';
import { archiveProjectProfile, createProjectProfile, fetchAllProjectProfiles, fetchProfileContacts, fetchProjectProfile, requestProfileEdit, uniqueNamespacePrefix, updateProjectProfile } from '../src/controllers/profile';
import ProfileModel from '../src/db/model/profile';
import FauxExpress from './src/fauxexpress';

const p0 = path.join(__dirname, 'fixtures/select-profiles.json');
const selectProfiles = JSON.parse(fs.readFileSync(p0, 'utf8'));

const p1 = path.join(__dirname, 'fixtures/insert-profile.json');
const insertProfile = JSON.parse(fs.readFileSync(p1, 'utf8'));

const p2 = path.join(__dirname, 'fixtures/user-template.json');
const userRequest = JSON.parse(fs.readFileSync(p2, 'utf8'));

const p3 = path.join(__dirname, 'fixtures/select-profile-contacts.json');
const selectProfilesContacts = JSON.parse(fs.readFileSync(p3, 'utf8'));

const client = new Pool().connect();

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

jest.mock('../src/libs/fulfillment', () => {
  const p4 = path.join(__dirname, 'fixtures/provisioning-context.json');
  const natsContext = JSON.parse(fs.readFileSync(p4, 'utf8'));
  const natsSubject = 'edit';
  return {
    fulfillNamespaceEdit: jest.fn().mockResolvedValue({natsContext, natsSubject}),
  };
});

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


  it('All profiles are returned as administrator', async () => {
    const req = {
      user: { roles: ['administrator',] },
    };

    client.query.mockReturnValueOnce({ rows: selectProfiles });

    // @ts-ignore
    await fetchAllProjectProfiles(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('All user profiles are returned', async () => {
    const req = {
      user: userRequest,
    };

    client.query.mockReturnValueOnce({ rows: selectProfiles });

    // @ts-ignore
    await fetchAllProjectProfiles(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('ProfileModel findAll method is called when all profiles are returned to an admin user', async () => {
    const req = {
      user: { roles: ['administrator',] },
    };

    const findAll = ProfileModel.prototype.findAll = jest.fn();
    const findProfilesByUserId = ProfileModel.prototype.findProfilesByUserId = jest.fn();

    // @ts-ignore
    await fetchAllProjectProfiles(req, ex.res);

    expect(findAll).toHaveBeenCalledTimes(1);
    expect(findProfilesByUserId).toHaveBeenCalledTimes(0);
  });

  it('ProfileModel findProfilesByUserId method is called when all profiles are returned to a non-admin user',
    async () => {
      const req = {
        user: {
          roles: [],
          id: 1,
        },
      };

      const findAll = ProfileModel.prototype.findAll = jest.fn();
      const findProfilesByUserId = ProfileModel.prototype.findProfilesByUserId = jest.fn();

      // @ts-ignore
      await fetchAllProjectProfiles(req, ex.res);

      expect(findAll).toHaveBeenCalledTimes(0);
      expect(findProfilesByUserId).toHaveBeenCalledTimes(1);
      expect(findProfilesByUserId.mock.calls[0][0]).toBe(req.user.id);
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
      params: { profileId: 118 },
      user: userRequest,
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

  it('A single profile is returned as administrator', async () => {
    const req = {
      params: { profileId: 118 },
      user: { roles: ['administrator',] },
    };
    client.query.mockReturnValueOnce({ rows: [selectProfiles[2]] });


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
      userId: 1,
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

  it('A project is updated with optional metadata', async () => {
    const body = JSON.parse(JSON.stringify(insertProfile));
    const aBody = {
      ...body,
      id: 9,
      createdAt: '2020-05-19T20:02:54.561Z',
      updateAt: '2020-05-19T20:02:54.561Z',
      fileTransfer: true,
      userId: 1,
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
      },
    }

    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(updateProjectProfile(req, ex.res)).rejects.toThrow();

    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.json).not.toBeCalled();
  });

  it('A project fails to update with incorrect user Id', async () => {
    const body = JSON.parse(JSON.stringify(insertProfile));
    const aBody = {
      id: 9,
      ...body,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: 2,
    };
    const req = {
      params: { profileId: 1 },
      body: aBody,
      user: {
        id: 1,
      },
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
      userId: 4,
    };
    const req = {
      params: { profileId: 9 },
      user: {
        roles: [],
        id: 4,
      },
    }

    client.query.mockReturnValue({ rows: [aBody] });

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


  it('A profiles contacts are returned', async () => {
    const req = {
      params: { profileId: 1 },
      user: userRequest,
    };

    client.query.mockReturnValueOnce({ rows: [selectProfiles[0]] });
    client.query.mockReturnValueOnce({ rows: selectProfilesContacts });

    // @ts-ignore
    await fetchProfileContacts(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('Fetch single profile contacts should throw', async () => {
    const req = {
      params: { profileId: 1 },
      user: userRequest,
    };
    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(fetchProfileContacts(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it('A profile edit request is created', async () => {
    const req = {
      params: { profileId: 118 },
      body: selectProfiles[2],
    }

    client.query.mockResolvedValue({ rows: [{ count: '0' }] });

    await requestProfileEdit(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.end).toBeCalled();
  })
});
