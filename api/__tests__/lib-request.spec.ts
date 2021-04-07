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
import ContactModel from '../src/db/model/contact';
import RequestModel from '../src/db/model/request';
import { fulfillEditRequest } from '../src/libs/fulfillment';
import { processProfileContactsEdit, requestProjectProfileEdit } from '../src/libs/request';

const p0 = path.join(__dirname, 'fixtures/get-requests.json');
const requests = JSON.parse(fs.readFileSync(p0, 'utf8'));

const p1 = path.join(__dirname, 'fixtures/get-provisioning-context.json');
const natsContext = JSON.parse(fs.readFileSync(p1, 'utf8'));

const p2 = path.join(__dirname, 'fixtures/select-profile.json');
const profile = JSON.parse(fs.readFileSync(p2, 'utf8'))[0];

const p3 = path.join(__dirname, 'fixtures/get-request-edit-contacts.json');
const contactEditRequest = JSON.parse(fs.readFileSync(p3, 'utf8'))[0];

const client = new Pool().connect();

jest.mock('../src/libs/fulfillment', () => ({
  fulfillEditRequest: jest.fn(),
}));

describe('Request services', () => {
  it('requestProjectProfileEdit works correctly', async () => {
    const natsSubject = 'registry_project_provisioning';
    const profileId = 4;

    // @ts-ignore
    fulfillEditRequest.mockResolvedValue({
      natsContext,
      natsSubject,
    });

    client.query.mockReturnValueOnce({ rows: [] });
    client.query.mockReturnValueOnce({ rows: ['mockRequest'] });

    const result = await requestProjectProfileEdit(profileId, profile);
    expect(result).toBeDefined();
  });

  it('requestProjectProfileEdit fails due to existing request', async () => {
    RequestModel.prototype.findForProfile = jest.fn().mockResolvedValue(requests);

    await expect(requestProjectProfileEdit(4, profile))
      .rejects
      .toThrow('Cant proceed as the profile has existing request');
  });

  it('A contact edit request is processed', async () => {
    const contacts = contactEditRequest.editObject;
    const update = ContactModel.prototype.update = jest.fn();
    await processProfileContactsEdit(contactEditRequest);

    expect(update).toHaveBeenCalledTimes(contacts.length);
  });
});
