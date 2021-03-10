// Copyright © 2020 Province of British Columbia
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

import { logger } from '@bcgov/common-nodejs-utils';
import { Pool } from 'pg';
import { CommonFields, Model } from './model';

export interface BotMessage extends CommonFields {
    requestId: number;
    natsSubject: string;
    natsContext: string;
    clusterName: string;
    hasCallback: boolean;
}

export default class BotMessageModel extends Model {
    table: string = 'bot_message';
    requiredFields: string[] = [
        'request_id', 'nats_subject', 'nats_context', 'cluster_name', 'has_callback'
    ];
    pool: Pool;

    constructor(pool: any) {
        super();
        this.pool = pool;
    }

    async create(data: BotMessage): Promise<BotMessage> {
        const query = {
            text: `INSERT INTO ${this.table}
            (request_id, nats_subject, nats_context, cluster_name, has_callback)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
            values: [
                data.requestId,
                data.natsSubject,
                data.natsContext,
                data.clusterName,
                data.hasCallback,
            ],
        };

        try {
            const results = await this.runQuery(query);
            return results.pop();
        } catch (err) {
            const message = `Unable to create request`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async update(botMessageId: number, data: BotMessage): Promise<BotMessage> {
        const values: any[] = [];
        const query = {
            text: `UPDATE ${this.table}
            SET
            request_id = $1, nats_subject = $2, nats_context = $3, cluster_name = $4, has_callback = $5
            WHERE id = ${botMessageId}
            RETURNING *;`,
            values,
        };

        try {
            const record = await this.findById(botMessageId);
            const aData = { ...record, ...data };
            query.values = [
                aData.requestId,
                aData.natsSubject,
                aData.natsContext,
                aData.clusterName,
                aData.hasCallback,
            ];

            const results = await this.runQuery(query);
            return results.pop();
        } catch (err) {
            const message = `Unable to update request ID ${botMessageId}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async delete(botMessageId: number): Promise<BotMessage> {
        const query = {
            text: `UPDATE ${this.table}
            SET
            archived = true
            WHERE id = ${botMessageId}
            RETURNING *;
        `,
        };

        try {
            const results = await this.runQuery(query);
            return results.pop();
        } catch (err) {
            const message = `Unable to archive request`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async findForRequest(requestId: number): Promise<BotMessage[]> {
        const query = {
            text: `
                SELECT * FROM ${this.table}
                    WHERE request_id = ${requestId} AND archived = false;
            `,
        };

        try {
            return await this.runQuery(query);
        } catch (err) {
            const message = `Unable to fetch Request(s) with Request Id ${requestId}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }
}
