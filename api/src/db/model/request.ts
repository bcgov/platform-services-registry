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
import { parseEditObject } from '../../libs/utils';
import { NatsContext } from '../../types';
import { CommonFields, Model } from './model';

export const enum RequestType {
    Create = 'create',
    Edit = 'edit',
}

export const enum RequestEditType {
    Contacts = 'contacts',
    QuotaSize = 'quotaSize',
    ProjectProfile = 'projectProfile',
}

export const enum HumanActionType {
    Approve = 'approve',
    Reject = 'reject',
}

export interface Request extends CommonFields {
    profileId: number;
    type: RequestType;
    requiresHumanAction: boolean;
    isActive: boolean;
    userId: number;
    editType?: RequestEditType;
    editObject?: any;
}

export interface BotMessage extends CommonFields {
    requestId: number;
    natsSubject: string;
    natsContext: NatsContext;
    clusterName: string;
    receivedCallback: boolean;
}


export interface HumanAction extends CommonFields {
    requestId: number;
    type: HumanActionType;
    comment: string;
    userId: number;
}

export default class RequestModel extends Model {
    table: string = 'request';
    requiredFields: string[] = [
        'profileId', 'type', 'requires_human_action', 'is_active', 'user_id',
    ];
    pool: Pool;

    constructor(pool: any) {
        super();
        this.pool = pool;
    }

    async create(data: Request): Promise<Request> {
        const query = {
            text: `
                INSERT INTO ${this.table}
                (profile_id, edit_type, edit_object, type, requires_human_action, is_active, user_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
            values: [
                data.profileId,
                data.editType,
                JSON.stringify(data.editObject),
                data.type,
                data.requiresHumanAction,
                data.isActive,
                data.userId,
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

    async update(requestId: number, data: Request): Promise<Request> {
        const values: any[] = [];
        const query = {
            text: `
                UPDATE ${this.table}
                SET profile_id = $1, edit_type = $2, edit_object = $3, type = $4,
                requires_human_action = $5,is_active = $6, user_id = $7
                WHERE id = $8
                RETURNING *;`,
            values,
        };

        try {
            const record = await this.findById(requestId);
            const aData = { ...record, ...data };
            query.values = [
                aData.profileId,
                aData.editType,
                JSON.stringify(aData.editObject),
                aData.type,
                aData.requiresHumanAction,
                aData.isActive,
                aData.userId,
                requestId
            ];

            const results = await this.runQuery(query);
            return results.pop();
        } catch (err) {
            const message = `Unable to update request ID ${requestId}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async delete(requestId: number): Promise<Request> {
        const query = {
            text: `
                UPDATE ${this.table}
                SET archived = true
                WHERE id = $1
                RETURNING *;`,
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

    async findForProfile(profileId: number): Promise<Request[]> {
        const query = {
            text: `
                SELECT * FROM ${this.table}
                WHERE profile_id = ${profileId} AND is_active = true AND archived = false;`,
        };

        try {
            const results = await this.runQuery(query);
            
            return parseEditObject(results);
        } catch (err) {
            const message = `Unable to fetch Request(s) with Profile Id ${profileId}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    // overwrite base model because of JSON conversion
    async findAll(): Promise<any[]> {
        const query = {
            text: `
                SELECT * FROM ${this.table}
                WHERE archived = false;`,
        };

        try {
            const results = await this.runQuery(query);
            
            return parseEditObject(results);
        } catch (err) {
            const message = `Unable to fetch all Requests`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    // overwrite base model because of JSON conversion
    async findById(id: number): Promise<any> {
        const query = {
            text: `
                SELECT * FROM ${this.table}
                WHERE id = $1 AND archived = false;`,
            values: [id],
        };

        try {
            const results = await this.runQuery(query);
            const result = results.pop();
            return {
                ...result,
                editObject: JSON.parse(result.editObject),
            };
        } catch (err) {
            const message = `Unable to fetch Request with ID ${id}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async findActiveByFilter(filter: string, value: any): Promise<any> {
        const query = {
            text: `
                SELECT * FROM ${this.table}
                WHERE ${filter} = $1 AND is_active = true AND archived = false;`,
            values: [value],
        };

        try {
            const results = await this.runQuery(query);
            
            return parseEditObject(results);
        } catch (err) {
            const message = `Unable to fetch Request with filter ${filter} = ${value}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async findAllActive(): Promise<Request[]> {
        const query = {
            text: `
                SELECT * FROM ${this.table}
                WHERE is_active = true AND archived = false;`,
        };

        try {
            const results = await this.runQuery(query);
            
            return parseEditObject(results);
        } catch (err) {
            const message = `Unable to fetch all active Request(s)`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async updateCompletionStatus(requestId: number): Promise<Request> {
        const query = {
            text: `
                UPDATE ${this.table}
                SET is_active = false
                WHERE id = ${requestId}
                RETURNING *;`,
        };

        try {
            const results = await this.runQuery(query);
            return results.pop();
        } catch (err) {
            const message = `Unable to complete request`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async receivedHumanAction(requestId: number): Promise<Request> {
        const query = {
            text: `
                UPDATE ${this.table}
                SET requires_human_action = false
                WHERE id = ${requestId}
                RETURNING *;`,
        };

        try {
            const results = await this.runQuery(query);
            return results.pop();
        } catch (err) {
            const message = `Unable to complete request`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async createBotMessage(data: BotMessage): Promise<BotMessage> {
        const query = {
            text: `
                INSERT INTO bot_message
                (request_id, nats_subject, nats_context, cluster_name, received_callback)
                VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
            values: [
                data.requestId,
                data.natsSubject,
                JSON.stringify(data.natsContext),
                data.clusterName,
                data.receivedCallback,
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

    async updateCallbackStatus(botMessageId: number): Promise<BotMessage> {
        const values: any[] = [];
        const query = {
            text: `
                UPDATE bot_message
                SET request_id = $1, nats_subject = $2, nats_context = $3, cluster_name = $4, received_callback = $5
                WHERE id = ${botMessageId}
                RETURNING *;`,
            values,
        };

        try {
            const record = await this.findBotMessageById(botMessageId);
            const aData = { ...record};
            query.values = [
                aData.requestId,
                aData.natsSubject,
                JSON.stringify(aData.natsContext),
                aData.clusterName,
                aData.receivedCallback = true,
            ];

            const results = await this.runQuery(query);
            return results.pop();
        } catch (err) {
            const message = `Unable to update request ID ${botMessageId}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async findActiveBotMessagesByRequestId(requestId: number): Promise<BotMessage[]> {
        const query = {
            text: `
                SELECT * FROM bot_message
                WHERE request_id = ${requestId} AND received_callback = false AND archived = false;`,
        };

        try {
            const results = await this.runQuery(query);
            
            return parseEditObject(results);
        } catch (err) {
            const message = `Unable to fetch Request(s) with Request Id ${requestId}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    // overwrite base model because of JSON conversion
    async findBotMessageById(botMessageId: number): Promise<any> {
        const query = {
            text: `
                SELECT * FROM bot_message
                WHERE id = $1 AND archived = false;`,
            values: [botMessageId],
        };

        try {
            const results = await this.runQuery(query);
            const result = results.pop();
            return {
                ...result,
                editObject: JSON.parse(result.editObject),
            };
        } catch (err) {
            const message = `Unable to fetch Request with ID ${botMessageId}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async createHumanAction(data: HumanAction): Promise<BotMessage> {
        const query = {
            text: `
                INSERT INTO human_action
                (request_id, type, comment, user_id)
                VALUES ($1, $2, $3, $4) RETURNING *;`,
            values: [
                data.requestId,
                data.type,
                data.comment,
                data.userId,
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

    async findActiveByFilter(filter: string, value: any): Promise<any> {
        const query = {
            text: `
            SELECT * FROM ${this.table}
              WHERE ${filter} = $1 AND is_active = true AND archived = false;`,
            values: [value],
        };

        try {
            const results = await this.runQuery(query);
            
            return parseEditObject(results);
        } catch (err) {
            const message = `Unable to fetch Request with filter ${filter} = ${value}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async findAllActive(): Promise<Request[]> {
        const query = {
            text: `
                SELECT * FROM ${this.table}
                    WHERE is_active = true AND archived = false;
            `,
        };

        try {
            const results = await this.runQuery(query);
            
            return parseEditObject(results);
        } catch (err) {
            const message = `Unable to fetch all active Request(s)`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async isComplete(requestId: number): Promise<Request> {
        const query = {
            text: `UPDATE ${this.table}
            SET
            is_active = false
            WHERE id = ${requestId}
            RETURNING *;
        `,
        };

        try {
            const results = await this.runQuery(query);
            return results.pop();
        } catch (err) {
            const message = `Unable to complete request`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async createBotMessage(data: BotMessage): Promise<BotMessage> {
        const query = {
            text: `INSERT INTO bot_message
            (request_id, nats_subject, nats_context, cluster_name, received_callback)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
            values: [
                data.requestId,
                data.natsSubject,
                JSON.stringify(data.natsContext),
                data.clusterName,
                data.receivedCallback,
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

    async updateCallbackStatus(botMessageId: number): Promise<BotMessage> {
        const values: any[] = [];
        const query = {
            text: `UPDATE bot_message
            SET
            request_id = $1, nats_subject = $2, nats_context = $3, cluster_name = $4, received_callback = $5
            WHERE id = ${botMessageId}
            RETURNING *;`,
            values,
        };

        try {
            const record = await this.findBotMessageById(botMessageId);
            const aData = { ...record};
            query.values = [
                aData.requestId,
                aData.natsSubject,
                JSON.stringify(aData.natsContext),
                aData.clusterName,
                aData.receivedCallback = true,
            ];

            const results = await this.runQuery(query);
            return results.pop();
        } catch (err) {
            const message = `Unable to update request ID ${botMessageId}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async findActiveBotMessagesByRequestId(requestId: number): Promise<BotMessage[]> {
        const query = {
            text: `
                SELECT * FROM bot_message
                    WHERE request_id = ${requestId} AND received_callback = false AND archived = false;
            `,
        };

        try {
            const results = await this.runQuery(query);
            return results.map(result => {
                return {
                    ...result,
                    natsContext: JSON.parse(result.natsContext),
                }
            });
        } catch (err) {
            const message = `Unable to fetch Request(s) with Request Id ${requestId}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    // overwrite base model because of JSON conversion
    async findBotMessageById(botMessageId: number): Promise<any> {
        const query = {
            text: `
            SELECT * FROM bot_message
              WHERE id = $1 AND archived = false;`,
            values: [botMessageId],
        };

        try {
            const results = await this.runQuery(query);
            const result = results.pop();
            return {
                ...result,
                editObject: JSON.parse(result.natsContext),
            };
        } catch (err) {
            const message = `Unable to fetch Request with ID ${botMessageId}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async createHumanAction(data: HumanAction): Promise<BotMessage> {
        const query = {
            text: `INSERT INTO human_action
            (request_id, type, comment, user_id)
            VALUES ($1, $2, $3, $4) RETURNING *;`,
            values: [
                data.requestId,
                data.type,
                data.comment,
                data.userId,
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
}

