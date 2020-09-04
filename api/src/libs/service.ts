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
// Created by Jason Leach on 2020-06-2.
//

import { JWTServiceManager } from '@bcgov/common-nodejs-utils';
import axios, { AxiosInstance } from 'axios';
import config from '../config';

export interface Dependency {
  name: string;
  healthy: boolean;
  info: string;
}

export interface SSOConfig {
  uri: string;
  grantType: string;
  clientId: string;
  clientSecret: string;
}

export interface Options {
  sso: SSOConfig;
  baseURL: string;
}

export const enum BodyType {
  HTML = 'html',
  Text = 'text',
}

export const enum Encoding {
  Default = 'utf-8',
  Base64 = 'base64',
  Binary = 'binary',
  Hex = 'hex',
}

export const enum Priority {
  Default = 'normal',
  Low = 'low',
  High = 'high',
}

export const enum AttachmentContentType {
  String = 'string',
}

export interface Attachment {
  content: string;
  contentType: AttachmentContentType.String;
  encoding: Encoding.Base64;
  filename: string;
}

export interface Message {
  attachments?: Attachment[];
  bcc?: string[];
  bodyType: BodyType;
  body: string;
  cc?: string[];
  delayTS?: Date;
  encoding?: Encoding;
  from: string;
  priority?: Priority;
  subject: string;
  tag?: string;
  to: string[];
}

export interface SentMessage {
  to: string[];
  messageId: string;
}

export interface SendReciept {
  transactionId: string;
  messages: SentMessage[];
}

export class CommonEmailService {
  private tokenManager: JWTServiceManager;
  private axi: AxiosInstance;

  constructor(options: Options) {
    this.tokenManager = new JWTServiceManager(options.sso);
    this.axi = axios.create({
      baseURL: options.baseURL,
    });
  }

  public async health(): Promise<Dependency[]> {
    try {
      const token = await this.tokenManager.accessToken;
      const response = await this.axi.get('health', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const { dependencies } = response.data;

      return dependencies
    } catch (err) {
      const errmsg = 'Unable to fetch health status';
      throw new Error(`${errmsg}, reason = ${err.message}`);
    }
  }

  public async send(message: Message) {
    try {
      const token = await this.tokenManager.accessToken;
      const response = await this.axi.post('email', message, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const { txId, messages } = response.data;
      const theMessages = messages.map(m => {
        return {
          to: m.to,
          messageId: m.msgId,
        }
      });

      return {
        transactionId: txId,
        messages: theMessages,
      }
    } catch (err) {
      const errmsg = 'Unable to send message';
      throw new Error(`${errmsg}, reason = ${err.message}`);
    }
  }
}

const main = async () => {
  const options: Options = {
    baseURL: config.get('ches:baseURL'),
    sso: {
      uri: config.get('ches:ssoTokenURL'),
      grantType: config.get('ches:ssoGrantType'),
      clientId: config.get('ches:ssoClientId'),
      clientSecret: config.get('ches:ssoClientSecret'),
    },
  }
  const message: Message = {
    bodyType: BodyType.Text,
    body: 'Hello World',
    from: 'jason.leach@gov.bc.ca',
    subject: 'Test 123',
    to: ['jason.leach@fullboar.ca'],
  }

  const x = new CommonEmailService(options);
  // await x.health();
  const reciept = await x.send(message);
  console.log(reciept);
}

main();
