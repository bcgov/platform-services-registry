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
import { fetchProfileContacts, requestProfileContactsEdit, requestProjectProfileEdit } from '../src/controllers/profile';
import FauxExpress from './src/fauxexpress';

const p0 = path.join(__dirname, 'fixtures/insert-profile.json');
const insertProfile = JSON.parse(fs.readFileSync(p0, 'utf8'));

const p1 = path.join(__dirname, 'fixtures/select-profile-contacts.json');
const selectProfilesContacts = JSON.parse(fs.readFileSync(p1, 'utf8'));

const p2 = path.join(__dirname, 'fixtures/select-profile-contacts.json');
const productOwner = JSON.parse(fs.readFileSync(p2, 'utf8'))[0];
const technicalContact = JSON.parse(fs.readFileSync(p2, 'utf8'))[1];

const client = new Pool().connect();

jest.mock('../src/libs/fulfillment', () => {
  const p3 = path.join(__dirname, 'fixtures/get-provisioning-context.json');
  const natsContext = JSON.parse(fs.readFileSync(p3, 'utf8'));
  const natsSubject = 'edit';
  return {
    fulfillEditRequest: jest.fn().mockResolvedValue({ natsContext, natsSubject }),
  };
});

describe('Profile event handlers', () => {
  let ex;

  beforeEach(() => {
    jest.clearAllMocks();

    ex = new FauxExpress();
  });

  it('A profiles contacts are returned', async () => {
    const req = {
      params: { profileId: 1 },
    };

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
    };
    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(fetchProfileContacts(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it('A project-profile edit request is created', async () => {
    const req = {
      params: { profileId: 4 },
      body: insertProfile,
    }

    client.query.mockResolvedValue({ rows: [{ count: '0' }] });

    await requestProjectProfileEdit(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.end).toBeCalled();
  });

  it('A contact edit request is created', async () => {
    const req = {
      params: { profileId: 4 },
      body: {
        productOwner,
        technicalContact,
      },
    };

    client.query.mockResolvedValue(productOwner);

    client.query.mockResolvedValue({
      productOwner: {
        userId: 'jane1100',
        provider: 'github',
        email: 'jane.doe@example.com',
      },
      technicalContact: {
        userId: 'john1100',
        provider: 'github',
        email: 'john.doe@example.com',
      },
    });

    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });
    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });
    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });

    await requestProfileContactsEdit(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.end).toBeCalled();
  });

  it('A contact edit request fails to be created', async () => {
    const req = {
      params: { profileId: 4 },
      body: {
        productOwner,
        technicalContact,
      },
    };

    client.query.mockResolvedValue({
      productOwner: {
        userId: 'jane1100',
        provider: 'github',
        email: 'jane.doe@example.com',
      },
      technicalContact: {
        userId: 'john1100',
        provider: 'github',
        email: 'john.doe@example.com',
      },
    });

    client.query.mockImplementation(() => { throw new Error() });

    await expect(requestProfileContactsEdit(req, ex.res)).rejects.toThrow();

    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.end).not.toBeCalled();
  });
});
