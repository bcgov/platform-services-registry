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
    clusterNamespaceId: number,
    natsSubject?: string,
    natsContext?: string
}

export default class RequestModel extends Model {
    table: string = 'request';
    requiredFields: string[] = [
        'clusterNamespaceId',
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
            (name)
            VALUES ($1) RETURNING *;`,
            values: [
                data.clusterNamespaceId,
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
            text: `
        UPDATE ${this.table}
            SET
            name = $1
            WHERE id = ${requestId}
            RETURNING *;`,
            values,
        };

        try {
            const record = await this.findById(requestId);
            const aData = { ...record, ...data };
            query.values = [
                aData.clusterNamespaceId,
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
            text: `
        UPDATE ${this.table}
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

    async findForClusterNamespace(clusterNamespaceId: number): Promise<Request> {
        const query = {
            text: `
                SELECT * FROM ${this.table}
                    WHERE cluster_namespace_id = ${clusterNamespaceId};
            `,
        };

        try {
            const results = await this.runQuery(query);
            return results.pop();
        } catch (err) {
            const message = `Unable to find request by cluster_namespace ${clusterNamespaceId}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    };
}
