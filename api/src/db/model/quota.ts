//
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
//

'use strict';

import { logger } from '@bcgov/common-nodejs-utils';
import { Pool } from 'pg';
import { CommonFields, Model } from './model';

export enum QuotaSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
}

export interface Quotas {
    cpu: {
        requests: number;
        limits: number;
    };
    memory: {
        requests: string;
        limits: string;
    };
    storage: {
        block: string;
        file: string;
        backup: string;
        capacity: string;
    };
}

export interface Quota extends CommonFields {
    cpuRequests: number;
    cpuLimits: number;
    memoryRequests: string;
    memoryLimits: string;
    storageBlock: string;
    storageFile: string;
    storageBackup: string;
    storageCapacity: string;
}

export default class QuotaModel extends Model {
    table: string = 'ref_quota';
    requiredFields: string[] = [
        'cpu_requests',
        'cpu_limits',
        'memory_requests',
        'memory_limits',
        'storage_block',
        'storage_file',
        'storage_backup',
        'storage_capacity',
    ];
    pool: Pool;

    constructor(pool: any) {
        super();
        this.pool = pool;
    }

    async create(): Promise<any> {
        // this is intentional (required by Sonarcloud)
    }

    async update(): Promise<any> {
        // this is intentional (required by Sonarcloud)
    }

    async delete(): Promise<any> {
        // this is intentional (required by Sonarcloud)
    }

    async findQuota(): Promise<any[]> {
        const query = {
            text: `
          SELECT * FROM ${this.table};
          `,
        };

        try {
            return await this.runQuery(query);
        } catch (err) {
            const message = `Unable to fetch all Quota`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }

    async findQuotaSizes(): Promise<any> {
        try {
            const quotaResponse = await this.findQuota()
            const quota = quotaResponse

            return [
                {
                    name: quota[0].name,
                    cpuNums: [quota[0].cpuRequests, quota[0].cpuLimits],
                    memoryNums: [quota[0].memory_requests, quota[0].memory_limits],
                    storageNums: [quota[0].storage_file, quota[0].storage_backup],
                },
                {
                    name: quota[1].name,
                    cpuNums: [quota[1].cpuRequests, quota[1].cpuLimits],
                    memoryNums: [quota[1].memory_requests, quota[1].memory_limits],
                    storageNums: [quota[1].storage_file, quota[1].storage_backup],
                },
                {
                    name: quota[2].name,
                    cpuNums: [quota[2].cpuRequests, quota[2].cpuLimits],
                    memoryNums: [quota[2].memory_requests, quota[2].memory_limits],
                    storageNums: [quota[2].storage_file, quota[2].storage_backup],
                },
            ];
        } catch (err) {
            const message = `Unable to get quota sizes`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    };

    async findForQuotaSize(quotaSize: QuotaSize): Promise<any> {
        const query = {
            text: `
                SELECT json_build_object(
                    'cpu', (SELECT row_to_json(d) FROM (SELECT cpu_requests AS "requests", cpu_limits AS "limits"
                        FROM ref_quota WHERE id = '${quotaSize}') d),
                    'memory', (SELECT row_to_json(d) FROM (SELECT memory_requests AS "requests", memory_limits AS "limits"
                        FROM ref_quota WHERE id = '${quotaSize}') d),
                    'storage', (SELECT row_to_json(d) FROM (SELECT storage_block AS "block", storage_file AS "file", storage_backup AS "backup", storage_capacity AS "capacity"
                        FROM ref_quota WHERE id = '${quotaSize}') d)
                );
            `
        };

        try {
            const results = await this.runQuery(query);
            return results.pop().jsonBuildObject;
        } catch (err) {
            const message = `Unable to retrieve quotas object by size ${quotaSize}`;
            logger.error(`${message}, err = ${err.message}`);

            throw err;
        }
    }
}
