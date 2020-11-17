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

import mockAxios from 'axios';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { contactsForProfile, MessageType, sendProvisioningMessage } from '../src/libs/messaging';

const p1 = path.join(__dirname, 'fixtures/select-profile-contacts.json');
const contacts = JSON.parse(fs.readFileSync(p1, 'utf8'));

const p2 = path.join(__dirname, 'fixtures/post-send-email-resp.json');
const send = JSON.parse(fs.readFileSync(p2, 'utf8'));


describe('Services', () => {

  const client = new Pool().connect();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Contact details are returned', async () => {

    client.query.mockReturnValue({ rows: contacts });

    const result = await contactsForProfile(12345);

    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
    expect(client.query.mock.calls).toMatchSnapshot();
  });

  it('Contact details not returned', async () => {

    client.query.mockImplementation(() => { throw new Error() });

    const result = await contactsForProfile(12345);

    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
    expect(client.query.mock.calls).toMatchSnapshot();
  });

  it('Provisioning started message is sent', async () => {
    // @ts-ignore
    mockAxios.fn.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: send,
      })
    );
    client.query.mockReturnValue({ rows: contacts });

    const result = await sendProvisioningMessage(12345, MessageType.ProvisioningStarted);

    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
  });

  it('Provisioning completed message is sent', async () => {
    // @ts-ignore
    mockAxios.fn.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: send,
      })
    );
    client.query.mockReturnValue({ rows: contacts });

    const result = await sendProvisioningMessage(12345, MessageType.ProvisioningCompleted);

    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
  });

  it('No message type results in a message not being sent', async () => {
    // @ts-ignore
    mockAxios.fn.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: send,
      })
    );
    client.query.mockReturnValue({ rows: contacts });

    const result = await sendProvisioningMessage(12345, 555);

    expect(result).not.toBeDefined();
  });

  it('No contacts results in a message not being sent', async () => {
    // @ts-ignore
    mockAxios.fn.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: send,
      })
    );
    client.query.mockReturnValue({ rows: [] });

    const result = await sendProvisioningMessage(12345, MessageType.ProvisioningStarted);

    expect(result).not.toBeDefined();
  });
});
