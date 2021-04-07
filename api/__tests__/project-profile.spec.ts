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
import { camelCase } from 'lodash';
import path from 'path';
import { Pool } from 'pg';
import { archiveProjectProfile, createProjectProfile, fetchAllProjectProfiles, fetchProjectProfile, uniqueNamespacePrefix, updateProjectProfile } from '../src/controllers/project-profile';
import ProfileModel from '../src/db/model/profile';
import { AccessFlag } from '../src/libs/authorization';
import { requestProjectProfileEdit } from '../src/libs/request';
import FauxExpress from './src/fauxexpress';

const p0 = path.join(__dirname, 'fixtures/select-profiles.json');
const selectProfiles = JSON.parse(fs.readFileSync(p0, 'utf8'));

const p1 = path.join(__dirname, 'fixtures/insert-profile.json');
const insertProfile = JSON.parse(fs.readFileSync(p1, 'utf8'));

const p2 = path.join(__dirname, 'fixtures/get-authenticated-user.json');
const authenticatedUser = JSON.parse(fs.readFileSync(p2, 'utf8'));

const p3 = path.join(__dirname, 'fixtures/select-default-cluster.json');
const selectDefaultCluster = JSON.parse(fs.readFileSync(p3, 'utf8'));

const p4 = path.join(__dirname, 'fixtures/select-profile.json');
const selectProfile = JSON.parse(fs.readFileSync(p4, 'utf8'));

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

jest.mock('../src/libs/request', () => ({
  requestProjectProfileEdit: jest.fn(),
}));

describe('Project-profile event handlers', () => {
  let ex;

  beforeEach(() => {
    jest.clearAllMocks();

    ex = new FauxExpress();
  });

  it('A project-profile is created', async () => {
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

    client.query.mockReturnValueOnce({ rows: selectDefaultCluster });
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

  it('A project-profile fails to create', async () => {
    const req = {
      body: insertProfile,
    };

    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(createProjectProfile(req, ex.res)).rejects.toThrow();

    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.json).not.toBeCalled();
  });

  it('All project-profiles are returned', async () => {
    const req = {
      user: authenticatedUser,
    };

    client.query.mockReturnValueOnce({ rows: selectProfiles });

    await fetchAllProjectProfiles(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('All project-profiles are returned to an administrator', async () => {
    const req = {
      user: { ...authenticatedUser, accessFlags: [AccessFlag.EditAll,] },
    };

    const findAll = ProfileModel.prototype.findAll = jest.fn();
    const findProfilesByUserId = ProfileModel.prototype.findProfilesByUserIdOrEmail = jest.fn();

    await fetchAllProjectProfiles(req, ex.res);

    expect(findAll).toHaveBeenCalledTimes(1);
    expect(findProfilesByUserId).toHaveBeenCalledTimes(0);
  });

  it('All project-profiles are returned to non-administrator',
    async () => {
      const req = {
        user: authenticatedUser,
      };

      const findAll = ProfileModel.prototype.findAll = jest.fn();
      const findProfilesByUserId = ProfileModel.prototype.findProfilesByUserIdOrEmail = jest.fn();

      await fetchAllProjectProfiles(req, ex.res);

      expect(findAll).toHaveBeenCalledTimes(0);
      expect(findProfilesByUserId).toHaveBeenCalledTimes(1);
      expect(findProfilesByUserId.mock.calls[0][0]).toBe(req.user.id);
    });

  it('Fetch all project-profiles should throw', async () => {
    const req = {};
    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(fetchAllProjectProfiles(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it('A single project-profiles is returned', async () => {
    const req = {
      params: { profileId: 4 },
    };
    client.query.mockReturnValueOnce({ rows: selectProfile });

    await fetchProjectProfile(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('Fetch single project-profiles should throw', async () => {
    const req = {
      params: { profileId: 4 },
    };
    client.query.mockImplementation(() => { throw new Error() });

    await expect(fetchProjectProfile(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it('Update a project-profile with non provisioner-related changes', async () => {
    const body = {
      id: 4,
      name: "Project X",
      description: "This is a cool project.",
      criticalSystem: false,
      prioritySystem: false,
      busOrgId: "CITZ",
      notificationEmail: true,
      notificationSms: true,
    };
    const req = {
      params: { profileId: 4 },
      body,
    };

    client.query.mockReturnValueOnce({ rows: selectProfile });
    const update = ProfileModel.prototype.update = jest.fn();

    await updateProjectProfile(req, ex.res);

    expect(update).toHaveBeenCalledTimes(1);
    expect(requestProjectProfileEdit).toHaveBeenCalledTimes(0);

<<<<<<< HEAD
=======
    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
  });

  it('Request project-profile edit with provisioner-related changes', async () => {
    const body = {
      id: 4,
      name: "Project X",
      description: "This is a cool project with modified description",
      criticalSystem: false,
      prioritySystem: false,
      busOrgId: "CITZ",
    };
    const req = {
      params: { profileId: 4 },
      body,
    };

    client.query.mockReturnValueOnce({ rows: selectProfile });

    const update = ProfileModel.prototype.update = jest.fn();

    await updateProjectProfile(req, ex.res);

    expect(update).toHaveBeenCalledTimes(0);
    expect(requestProjectProfileEdit).toHaveBeenCalledTimes(1);

>>>>>>> 5fc9710 (refactor and modify unit tests)
    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
  });

<<<<<<< HEAD
  it('Request project-profile edit with provisioner-related changes', async () => {
    const body = {
      id: 4,
      name: "Project X",
      description: "This is a cool project with modified description",
      criticalSystem: false,
      prioritySystem: false,
      busOrgId: "CITZ",
    };
    const req = {
      params: { profileId: 4 },
      body,
    };

    client.query.mockReturnValueOnce({ rows: selectProfile });

    const update = ProfileModel.prototype.update = jest.fn();

    await updateProjectProfile(req, ex.res);

    expect(update).toHaveBeenCalledTimes(0);
    expect(requestProjectProfileEdit).toHaveBeenCalledTimes(1);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
  });

=======
>>>>>>> 5fc9710 (refactor and modify unit tests)
  it('A project-profiles fails to update', async () => {
    const aBody = {
      id: 4,
      ...insertProfile,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const req = {
      params: { profileId: 4 },
      body: aBody,
    }

    client.query.mockImplementation(() => { throw new Error() });

    await expect(updateProjectProfile(req, ex.res)).rejects.toThrow();

    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.json).not.toBeCalled();
  });

  it('A project-profiles does not allow updating name', async () => {
    const body = {
      id: 4,
      name: "Project X ATTEMPTED NAME CHANGE",
      description: "This is a cool project.",
      criticalSystem: false,
      prioritySystem: false,
      busOrgId: "CITZ",
      notificationEmail: true,
      notificationSms: true,
    };
    const req = {
      params: { profileId: 4 },
      body,
    };

    client.query.mockReturnValueOnce({ rows: selectProfile });
    const update = ProfileModel.prototype.update = jest.fn();

    await updateProjectProfile(req, ex.res);

    expect(update).toHaveBeenCalledTimes(1);
    expect(requestProjectProfileEdit).toHaveBeenCalledTimes(0);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
  });

  it('A project-profiles is archived', async () => {
    const aBody = {
      id: 4,
      ...insertProfile,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: 1,
    };
    const req = {
      params: { profileId: 4 },
    }

    client.query.mockReturnValue({ rows: [aBody] });

    await archiveProjectProfile(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.json).not.toBeCalled();
    expect(ex.res.end).toBeCalled();
  });

  it('A project-profiles fails to archive', async () => {
    const req = {
      params: { profileId: 4 },
    }

    client.query.mockImplementation(() => { throw new Error() });

    await expect(archiveProjectProfile(req, ex.res)).rejects.toThrow();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.res.json).not.toBeCalled();
    expect(ex.res.end).not.toBeCalled();
  });


  it('Unique project-profiles names are derived', async () => {
    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });
    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });
    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });

    const result = await uniqueNamespacePrefix();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(result).toMatchSnapshot();
  });
});
