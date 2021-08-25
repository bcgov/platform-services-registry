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
import createContact from '../src/controllers/contact';
import FauxExpress from './src/fauxexpress';

const p0 = path.join(__dirname, 'fixtures/insert-contact.json');
const insertContact = JSON.parse(fs.readFileSync(p0, 'utf8'));

const client = new Pool().connect();

describe('Contact event handlers', () => {
  let ex;

  beforeEach(() => {
    jest.clearAllMocks();

    ex = new FauxExpress();
  });

  it('A contact is created', async () => {
    const req = {
      body: insertContact,
    };

    const addon = {
      id: 2,
      createdAt: "2020-09-10T18:14:13.304Z",
      updatedAt: "2020-09-10T18:14:13.304Z",
    };

    client.query.mockResolvedValue({ rows: [{ ...insertContact, ...addon }] });

    // @ts-ignore
    await createContact(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('A contact fails to create due to db transaction error', async () => {
    const req = {
      body: insertContact,
    };

    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(createContact(req, ex.res)).rejects.toThrow();
    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.json).not.toBeCalled();
  });


  it('A contact fails to create due to missing fields in body', async () => {
    const req = {
      body: {
        firstName: "John",
      },
    };

    // @ts-ignore
    await expect(createContact(req, ex.res)).rejects.toThrow();
    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.json).not.toBeCalled();
  });
});
