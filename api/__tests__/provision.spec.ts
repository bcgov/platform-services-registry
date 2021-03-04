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
import { processProfileContactsEdit } from '../src/controllers/provision';

const p0 = path.join(__dirname, 'fixtures/select-request-edit-contacts.json');
const contactEditRequest = JSON.parse(fs.readFileSync(p0, 'utf8'))[0];

const p1 = path.join(__dirname, 'fixtures/select-profile-contacts.json');
const productOwner = JSON.parse(fs.readFileSync(p1, 'utf8'))[0];
const technicalContact = JSON.parse(fs.readFileSync(p1, 'utf8'))[1];

const client = new Pool().connect();

describe('Provision event handlers', () => {
    it('A contact edit request is processed', async () => {
        const req = contactEditRequest;

        const editedPO = {
            productOwner,
        };

        const editedTC = {
            technicalContact,
        };

        client.query.mockResolvedValue({ ...editedPO, ...editedTC });

        client.query.mockResolvedValueOnce({ rows: [{ editedPO }] });
        client.query.mockResolvedValueOnce({ rows: [{ editedPO }] });
        client.query.mockResolvedValueOnce({ rows: [{ editedTC }] });
        client.query.mockResolvedValueOnce({ rows: [{ editedTC }] });

        JSON.parse = jest.fn().mockImplementationOnce(() => {
            return contactEditRequest.editObject;
        });

        await processProfileContactsEdit(req);

        expect(client.query.mock.calls).toMatchSnapshot();
        expect(JSON.parse).toHaveBeenCalledTimes(1);
    });
});
