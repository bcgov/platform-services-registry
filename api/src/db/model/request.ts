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

export interface Request extends CommonFields {
    profileId: number,
    editType: string,
    editObject: string,
    natsSubject?: string,
    natsContext?: string,
}

export default class RequestModel extends Model {
    table: string = 'request';
    requiredFields: string[] = [
        'profileId', 'editType', 'editObject'
    ];
    pool: Pool;

    constructor(pool: any) {
        super();
        this.pool = pool;
    }

    async create(data: Request): Promise<Request> {
        const query = {
            text: `INSERT INTO ${this.table}
            (profile_id, edit_type, edit_object, nats_subject, nats_context)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
            values: [
                data.profileId,
                data.editType,
                data.editObject,
                data.natsSubject,
                data.natsContext
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
            text: `UPDATE ${this.table}
            SET
            profile_id = $1, edit_type = $2, edit_object = $3, nats_subject = $4, nats_context = $5
            WHERE id = ${requestId}
            RETURNING *;`,
            values,
        };

        try {
            const record = await this.findById(requestId);
            const aData = { ...record, ...data };
            query.values = [
                aData.profileId,
                aData.editType,
                aData.editObject,
                aData.natsSubject,
                aData.natsContext
            ];

            const results = await this.runQuery(query);
            return results.pop();
        } catch (err) {
            const message = `Unable to update request ID ${requestId}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    };

    async delete(requestId: number): Promise<Request> {
        const query = {
            text: `UPDATE ${this.table}
            SET
            archived = true
            WHERE id = ${requestId}
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
    };

    async findForProfile(profileId: number): Promise<Request[]> {
        const query = {
            text: `
                SELECT * FROM ${this.table}
                    WHERE profile_id = ${profileId} AND archived = false;
            `,
        };

        try {
            return await this.runQuery(query);
        } catch (err) {
            const message = `Unable to fetch Request(s) with Profile Id ${profileId}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    };
}
