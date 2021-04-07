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
import {
  addContactToProfile,
  fetchProfileAllowedQuotaSizes,
  fetchProfileContacts,
  fetchProfileEditRequests,
  fetchProfileQuotaSize,
<<<<<<< HEAD
  updateProfileContacts, updateProfileQuotaSize
} from '../src/controllers/profile';
import ContactModel from '../src/db/model/contact';
import { QuotaSize } from '../src/db/model/quota';
import RequestModel from '../src/db/model/request';
import { getQuotaSize } from '../src/libs/profile';
import { getAllowedQuotaSizes } from '../src/libs/quota';
import { requestProfileContactsEdit, requestProfileQuotaSizeEdit } from '../src/libs/request';
=======
  updateProfileContacts,
  updateProfileQuotaSize
} from '../src/controllers/profile';
import ContactModel from '../src/db/model/contact';
import { getProfileCurrentQuotaSize } from '../src/libs/profile';
import { getAllowedQuotaSizes } from '../src/libs/quota';
import { fetchEditRequests, requestContactsEdit, requestQuotaSizeEdit } from '../src/libs/request';
>>>>>>> 5fc9710 (refactor and modify unit tests)
import FauxExpress from './src/fauxexpress';

const p0 = path.join(__dirname, 'fixtures/select-profile.json');
const selectProfile = JSON.parse(fs.readFileSync(p0, 'utf8'));

const p1 = path.join(__dirname, 'fixtures/select-profile-contacts.json');
const selectProfilesContacts = JSON.parse(fs.readFileSync(p1, 'utf8'));
<<<<<<< HEAD

const p2 = path.join(__dirname, 'fixtures/get-requests.json');
const requests = JSON.parse(fs.readFileSync(p2, 'utf8'));
=======
const productOwner = selectProfilesContacts[0];
const technicalContact = selectProfilesContacts[1];
>>>>>>> 5fc9710 (refactor and modify unit tests)

const client = new Pool().connect();

jest.mock('../src/libs/profile', () => {
  return {
<<<<<<< HEAD
    getQuotaSize: jest.fn().mockResolvedValue('small'),
=======
    getProfileCurrentQuotaSize: jest.fn().mockResolvedValue('small'),
>>>>>>> 5fc9710 (refactor and modify unit tests)
  };
});

jest.mock('../src/libs/quota', () => {
  return {
    getAllowedQuotaSizes: jest.fn().mockReturnValue(['medium']),
  };
});

jest.mock('../src/libs/request', () => ({
<<<<<<< HEAD
  requestProjectProfileEdit: jest.fn(),
  requestProfileContactsEdit: jest.fn(),
  requestProfileQuotaSizeEdit: jest.fn(),
=======
  requestContactsEdit: jest.fn(),
  requestQuotaSizeEdit: jest.fn(),
  fetchEditRequests: jest.fn(),
>>>>>>> 5fc9710 (refactor and modify unit tests)
}));

describe('Profile event handlers', () => {
  let ex;

  beforeEach(() => {
    jest.clearAllMocks();

    ex = new FauxExpress();
  });

  it('Link a contact to profile successfully', async () => {
    const req = {
      params: { profileId: 4, contactId: 1 },
    };

    client.query.mockReturnValueOnce({ rows: [] });

    await addContactToProfile(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
  });

  it('Link a contact to profile should throw', async () => {
    const req = {
      params: { profileId: 4, contactId: 1 },
    };

    client.query.mockImplementation(() => { throw new Error() });

    await expect(addContactToProfile(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it('A profiles contacts are returned', async () => {
    const req = {
      params: { profileId: 1 },
    };

    client.query.mockReturnValueOnce({ rows: selectProfilesContacts });

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
    };
    client.query.mockImplementation(() => { throw new Error() });

    await expect(fetchProfileContacts(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it('Update profile contacts with non provisioner-related changes', async () => {
    const body = {
      productOwner: {
        id: 1,
        firstName: 'JaneTEST',
        lastName: 'DoeTEST',
        email: 'jane@example.com',
        githubId: 'jane1100',
        roleId: 1,
      },
      technicalContact: {
        id: 2,
<<<<<<< HEAD
        firstName: 'JohnTEST',
        lastName: 'DoeTEST',
        email: 'john.doe@example.com',
        githubId: 'john1100',
=======
        firstName: 'JimTEST',
        lastName: 'DoeTEST',
        email: 'jim@example.com',
        githubId: 'jim1100',
>>>>>>> 5fc9710 (refactor and modify unit tests)
        roleId: 2,
      }
    };
    const req = {
      params: { profileId: 4 },
      body,
    };

<<<<<<< HEAD
    client.query.mockReturnValueOnce({ rows: selectProfilesContacts });
=======
    client.query.mockReturnValueOnce({ rows: [productOwner] });
    client.query.mockReturnValueOnce({ rows: [technicalContact] });
>>>>>>> 5fc9710 (refactor and modify unit tests)
    const update = ContactModel.prototype.update = jest.fn();

    await updateProfileContacts(req, ex.res);
    expect(update).toHaveBeenCalledTimes(2);
<<<<<<< HEAD
    expect(requestProfileContactsEdit).toHaveBeenCalledTimes(0);
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
  });
=======
    expect(requestContactsEdit).toHaveBeenCalledTimes(0);
>>>>>>> 5fc9710 (refactor and modify unit tests)

  it('Request profile contacts edit with provisioner-related changes', async () => {
    const body = {
      productOwner: {
        id: 1,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'janeTEST@example.com',
        githubId: 'jane1100TEST',
        roleId: 1,
      },
      technicalContact: {
        id: 2,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doeTEST@example.com',
        githubId: 'john1100TEST',
        roleId: 2,
      }
    };
    const req = {
      params: { profileId: 4 },
      body,
    };

    client.query.mockReturnValueOnce({ rows: selectProfilesContacts });
    const update = ContactModel.prototype.update = jest.fn();

    await updateProfileContacts(req, ex.res);
    expect(update).toHaveBeenCalledTimes(0);
    expect(requestProfileContactsEdit).toHaveBeenCalledTimes(1);
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
  });

<<<<<<< HEAD
  it('Update profile contacts should throw', async () => {
    const req = {
      params: { profileId: 4 },
      body: {},
    };

    await expect(updateProfileContacts(req, ex.res)).rejects.toThrow();

    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.end).not.toBeCalled();
  });

  it('A profiles quota size is returned', async () => {
    const req = {
      params: { profileId: 4 },
    };

    client.query.mockReturnValueOnce({ rows: selectProfile });
    // @ts-ignore
    getQuotaSize.mockResolvedValue(QuotaSize.Small);
=======
  it('Request profile contacts edit with provisioner-related changes', async () => {
    const body = {
      productOwner: {
        id: 1,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'janeTEST@example.com',
        githubId: 'jane1100TEST',
        roleId: 1,
      },
      technicalContact: {
        id: 2,
        firstName: 'Jim',
        lastName: 'Doe',
        email: 'jimTEST@example.com',
        githubId: 'jim1100TEST',
        roleId: 2,
      }
    };
    const req = {
      params: { profileId: 4 },
      body,
    };

    client.query.mockReturnValueOnce({ rows: [productOwner] });
    client.query.mockReturnValueOnce({ rows: [technicalContact] });
    const update = ContactModel.prototype.update = jest.fn();

    await updateProfileContacts(req, ex.res);
    expect(update).toHaveBeenCalledTimes(0);
    expect(requestContactsEdit).toHaveBeenCalledTimes(1);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
  });

  it('Update profile contacts should throw', async () => {
    const req = {
      params: { profileId: 4 },
      body: {},
    };

    await expect(updateProfileContacts(req, ex.res)).rejects.toThrow();

    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.end).not.toBeCalled();
  });

  it('A profiles quota size is returned', async () => {
    const req = {
      params: { profileId: 4 },
    };

    client.query.mockReturnValueOnce({ rows: selectProfile });

    await fetchProfileQuotaSize(req, ex.res);
    expect(getProfileCurrentQuotaSize).toHaveBeenCalledTimes(1);
>>>>>>> 5fc9710 (refactor and modify unit tests)

    await fetchProfileQuotaSize(req, ex.res);
    expect(getQuotaSize).toHaveBeenCalledTimes(1);
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('Fetch profiles quota size should throw', async () => {
    const req = {
      params: { profileId: 4 },
    };

    client.query.mockImplementation(() => { throw new Error() });

    await expect(fetchProfileQuotaSize(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();
<<<<<<< HEAD
=======

    expect(client.query.mock.calls).toMatchSnapshot();
>>>>>>> 5fc9710 (refactor and modify unit tests)
    expect(ex.responseData).toBeUndefined();
  });

  it('A list of quota options for a given profile is returned', async () => {
    const req = {
      params: { profileId: 4 },
    };

    client.query.mockReturnValueOnce({ rows: selectProfile });

    await fetchProfileAllowedQuotaSizes(req, ex.res);
    expect(getAllowedQuotaSizes).toHaveBeenCalledTimes(1);
<<<<<<< HEAD
=======

    expect(client.query.mock.calls).toMatchSnapshot();
>>>>>>> 5fc9710 (refactor and modify unit tests)
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('Fetch a list of quota options for a given profile should throw', async () => {
    const req = {
      params: { profileId: 4 },
    };

    client.query.mockImplementation(() => { throw new Error() });

    await expect(fetchProfileAllowedQuotaSizes(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();
<<<<<<< HEAD
    expect(ex.responseData).toBeUndefined();
  });

  it('Request profile quota size edit successfully', async () => {
    const body = {
      requestedQuotaSize: QuotaSize.Medium,
=======

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it('Request profile quota size edit successfully', async () => {
    const body = {
      requestedQuotaSize: 'medium',
>>>>>>> 5fc9710 (refactor and modify unit tests)
    };
    const req = {
      params: { profileId: 4 },
      body,
    };

    client.query.mockReturnValueOnce({ rows: selectProfile });

    await updateProfileQuotaSize(req, ex.res);
<<<<<<< HEAD

    expect(requestProfileQuotaSizeEdit).toHaveBeenCalledTimes(1);
=======
    expect(requestQuotaSizeEdit).toHaveBeenCalledTimes(1);

    expect(client.query.mock.calls).toMatchSnapshot();
>>>>>>> 5fc9710 (refactor and modify unit tests)
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
  });

  it('Request profile quota size edit should throw due to invalid quota upgrade', async () => {
    const body = {
<<<<<<< HEAD
      requestedQuotaSize: QuotaSize.Large,
=======
      requestedQuotaSize: 'large',
>>>>>>> 5fc9710 (refactor and modify unit tests)
    };
    const req = {
      params: { profileId: 4 },
      body,
    };

    client.query.mockReturnValueOnce({ rows: selectProfile });

    await expect(updateProfileQuotaSize(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();
<<<<<<< HEAD
    expect(requestProfileQuotaSizeEdit).toHaveBeenCalledTimes(0);
=======
    expect(requestQuotaSizeEdit).toHaveBeenCalledTimes(0);
    expect(client.query.mock.calls).toMatchSnapshot();
>>>>>>> 5fc9710 (refactor and modify unit tests)
    expect(ex.responseData).toBeUndefined();
  });

  it('Request profile quota size edit should throw due to db transaction issue', async () => {
    const body = {
      requestedQuotaSize: 'medium',
    };
    const req = {
      params: { profileId: 4 },
      body,
    };

    client.query.mockImplementation(() => { throw new Error() });

    await expect(updateProfileQuotaSize(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

<<<<<<< HEAD
=======
    expect(client.query.mock.calls).toMatchSnapshot();
>>>>>>> 5fc9710 (refactor and modify unit tests)
    expect(ex.responseData).toBeUndefined();
  });

  it('Profile edit requests are returned', async () => {
    const req = {
      params: { profileId: 4 },
    };

<<<<<<< HEAD
    RequestModel.prototype.findForProfile = jest.fn().mockResolvedValue(requests);

    await fetchProfileEditRequests(req, ex.res);

=======
    await fetchProfileEditRequests(req, ex.res);
    expect(fetchEditRequests).toHaveBeenCalledTimes(1);

    expect(client.query.mock.calls).toMatchSnapshot();
>>>>>>> 5fc9710 (refactor and modify unit tests)
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });
});
