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
import { fulfillEditRequest } from '../src/libs/fulfillment';
import { requestProjectProfileEdit } from '../src/libs/request';

const p0 = path.join(__dirname, 'fixtures/select-requests.json');
const selectRequests = JSON.parse(fs.readFileSync(p0, 'utf8'));

const p1 = path.join(__dirname, 'fixtures/get-provisioning-context.json');
const natsContext = JSON.parse(fs.readFileSync(p1, 'utf8'));

const client = new Pool().connect();

jest.mock('../src/libs/fulfillment', () => ({
  fulfillEditRequest: jest.fn(),
}));

describe('Request services', () => {

  it('requestProjectProfileEdit works correctly', async () => {
    const natsSubject = 'registry_project_provisioning';
    const profileId = 4;
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

    // @ts-ignore
    fulfillEditRequest.mockResolvedValue({
      natsContext,
      natsSubject,
    });

    client.query.mockReturnValueOnce({ rows: [] });
    client.query.mockReturnValueOnce({ rows: ['mockRequest'] });

    const result = await requestProjectProfileEdit(profileId, body);
    expect(result).toBeDefined();
  });

  it('requestProjectProfileEdit fails due to existing request', async () => {
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

    client.query.mockReturnValueOnce({ rows: selectRequests })

    await expect(requestProjectProfileEdit(4, body))
      .rejects
      .toThrow('Cant proceed due to existing request');
  });
});
