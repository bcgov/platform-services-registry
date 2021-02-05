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

const p0 = path.join(__dirname, 'fixtures/select-contact-edit-request.json');
const selectContactEditRequest = JSON.parse(fs.readFileSync(p0, 'utf8'));

const client = new Pool().connect();

describe('Provision event handlers', () => {
    it('A contact edit request is processed', async () => {
        const req = selectContactEditRequest;

        const editedPO = {
            productOwner: {
                roleId: 1,
                id: 233,
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@example.com',
                githubId: 'janedoe',
            },
        };

        const editedTC = {
            technicalContact: {
                roleId: 2,
                id: 234,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                githubId: 'john1100',
            },
        };

        client.query.mockResolvedValue({ ...editedPO, ...editedTC });

        client.query.mockResolvedValueOnce({ rows: [{ editedPO }] });
        client.query.mockResolvedValueOnce({ rows: [{ editedPO }] });
        client.query.mockResolvedValueOnce({ rows: [{ editedTC }] });
        client.query.mockResolvedValueOnce({ rows: [{ editedTC }] });

        JSON.parse = jest.fn().mockImplementationOnce(() => {
            return selectContactEditRequest.editObject;
        });

        await processProfileContactsEdit(req);

        expect(client.query.mock.calls).toMatchSnapshot();
        expect(JSON.parse).toHaveBeenCalledTimes(1);
    });
});
