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
import { updateContact } from '../src/controllers/contact';
import FauxExpress from './src/fauxexpress';

const p0 = path.join(__dirname, 'fixtures/select-profile-contacts.json');
const returnedContact = JSON.parse(fs.readFileSync(p0, 'utf8'))[0];

const p1 = path.join(__dirname, 'fixtures/insert-contact.json');
const insertContact = JSON.parse(fs.readFileSync(p1, 'utf8'));

const client = new Pool().connect();

jest.mock('../src/libs/fulfillment', () => {
  const p2 = path.join(__dirname, 'fixtures/get-provisioning-context.json');
  const natsContext = JSON.parse(fs.readFileSync(p2, 'utf8'));
  const natsSubject = 'edit';
  return {
    fulfillProfileEdit: jest.fn().mockResolvedValue({ natsContext, natsSubject }),
  };
});

describe('Contact event handlers', () => {
  let ex;

  beforeEach(() => {
    jest.clearAllMocks();

    ex = new FauxExpress();
  });

  it('A contact is updated', async () => {
    const body = insertContact;
    const req = {
      params: { contactId: 1 },
      body,
    }

    client.query.mockResolvedValue({ rows: [returnedContact] });

    // @ts-ignore
    await updateContact(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('A contact fails to update', async () => {
    const body = insertContact;
    const req = {
      params: { contactId: 1 },
      body,
    }

    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(updateContact(req, ex.res)).rejects.toThrow();

    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.json).not.toBeCalled();
  });
});
