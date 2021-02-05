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

export enum QuotaSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
};

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
};

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
    }

    async update(): Promise<any> {
    }

    async delete(): Promise<any> {
    }

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
