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

import { JWTServiceManager } from "@bcgov/common-nodejs-utils";
import axios, { AxiosInstance } from "axios";

export interface Dependency {
  name: string;
  healthy: boolean;
  info: string;
}

export interface Options {
  uri: string;
  grantType: string;
  clientId: string;
  clientSecret: string;
  baseURL: string;
}

export const enum BodyType {
  HTML = "html",
  Text = "text",
}

export const enum Encoding {
  Default = "utf-8",
  Base64 = "base64",
  Binary = "binary",
  Hex = "hex",
}

export const enum Priority {
  Default = "normal",
  Low = "low",
  High = "high",
}

export const enum MessageSendStatus {
  Accepted = "accepted",
  Cancelled = "cancelled",
  Completed = "completed",
  Failed = "failed",
  Pending = "pending",
}

export const enum AttachmentContentType {
  String = "string",
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
  delayTS?: number;
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

export interface SendReceipt {
  transactionId: string;
  messages: SentMessage[];
}

export interface MessageStatus {
  createdAt: Date;
  delayedUntil?: Date;
  messageId: string;
  status: MessageSendStatus;
  tag: string;
  transactionId: string;
  updatedAt: Date;
}

export default class CommonEmailService {
  private tokenManager: JWTServiceManager;

  private axi: AxiosInstance;

  constructor(options: Options) {
    const { uri, grantType, clientId, clientSecret } = options;
    this.tokenManager = new JWTServiceManager({
      uri,
      grantType,
      clientId,
      clientSecret,
    });
    this.axi = axios.create({
      baseURL: options.baseURL,
    });
  }

  public async health(): Promise<Dependency[]> {
    try {
      const token = await this.tokenManager.accessToken;
      const response = await this.axi.get("health", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const { dependencies } = response.data;

      return dependencies;
    } catch (err) {
      const msg = "Unable to fetch health status";
      throw new Error(`${msg}, reason = ${err.message}`);
    }
  }

  public async send(message: Message): Promise<SendReceipt> {
    try {
      const token = await this.tokenManager.accessToken;
      const response = await this.axi.post("email", message, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const { txId, messages } = response.data;
      const theMessages = messages.map((m) => ({
        to: m.to,
        messageId: m.msgId,
      }));

      return {
        transactionId: txId,
        messages: theMessages,
      };
    } catch (err) {
      const msg = "Unable to send message";
      throw new Error(`${msg}, reason = ${err.message}`);
    }
  }

  public async transactionStatus(
    transactionId: string
  ): Promise<MessageStatus[]> {
    const params = {
      txId: transactionId,
    };

    try {
      const token = await this.tokenManager.accessToken;
      const response = await this.axi.get("status", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      const processed = response.data.map((r) => {
        const { createdTS, delayTS, msgId, status, tag, txId, updatedTS } = r;
        return {
          createdAt: new Date(createdTS),
          delayedUntil: delayTS ? new Date(delayTS) : undefined,
          messageId: msgId,
          status,
          tag,
          transactionId: txId,
          updatedAt: new Date(updatedTS),
        };
      });

      return processed;
    } catch (err) {
      const msg = "Unable to fetch transaction status";
      throw new Error(`${msg}, reason = ${err.message}`);
    }
  }

  public async messageStatus(
    messageId: string
  ): Promise<MessageStatus | undefined> {
    const params = {
      msgId: messageId,
    };

    try {
      const token = await this.tokenManager.accessToken;
      const response = await this.axi.get("status", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      if (response.data.length === 0) {
        return;
      }

      const { createdTS, delayTS, msgId, status, tag, txId, updatedTS } =
        response.data.pop();
      return {
        createdAt: new Date(createdTS),
        delayedUntil: delayTS ? new Date(delayTS) : undefined,
        messageId: msgId,
        status,
        tag,
        transactionId: txId,
        updatedAt: new Date(updatedTS),
      };
    } catch (err) {
      const msg = "Unable to fetch message status";
      throw new Error(`${msg}, reason = ${err.message}`);
    }
  }
}
