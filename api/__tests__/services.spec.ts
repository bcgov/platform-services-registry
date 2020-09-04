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

import mockAxios from "axios";
import fs from 'fs';
import path from 'path';
import { BodyType, CommonEmailService, Message, Options } from '../src/libs/service';

const p0 = path.join(__dirname, 'fixtures/get-email-health-resp.json');
const health = JSON.parse(fs.readFileSync(p0, 'utf8'));

const p1 = path.join(__dirname, 'fixtures/post-send-email-resp.json');
const send = JSON.parse(fs.readFileSync(p1, 'utf8'));

describe('Services', () => {
  const options: Options = {
    baseURL: 'something',
    sso: {
      uri: 'something',
      grantType: 'something',
      clientId: 'something',
      clientSecret: 'something',
    },
  }
  const emailSvs = new CommonEmailService(options);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Health check works correctly', async () => {
    // @ts-ignore
    mockAxios.fn.get.mockImplementationOnce(() =>
      Promise.resolve({
        data: health,
      })
    );

    const result = await emailSvs.health();

    expect(result).toMatchSnapshot();
  });

  it('Health check fails gracefully', async () => {
    // @ts-ignore
    mockAxios.fn.get.mockImplementationOnce(() =>
      Promise.reject()
    );

    await expect(emailSvs.health()).rejects.toThrow();
  });

  it('Sending a message works correctly', async () => {
    // @ts-ignore
    mockAxios.fn.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: send,
      })
    );

    const message: Message = {
      bodyType: BodyType.Text,
      body: 'Hello World',
      from: 'phill@example.com',
      subject: 'Test 123',
      to: ['billips@example.com'],
    }

    const result = await emailSvs.send(message);

    expect(result).toMatchSnapshot();
  });

  it('Sending a message fails gracefully', async () => {
    // @ts-ignore
    mockAxios.fn.post.mockImplementationOnce(() =>
      Promise.reject()
    );

    const message: Message = {
      bodyType: BodyType.Text,
      body: 'Hello World',
      from: 'phill@example.com',
      subject: 'Test 123',
      to: ['billips@example.com'],
    }

    await expect(emailSvs.send(message)).rejects.toThrow();
  });
});
