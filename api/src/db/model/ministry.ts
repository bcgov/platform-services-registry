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

export interface Ministry extends CommonFields {
  name: string;
}

export default class MinistryModel extends Model {
  table: string = 'ref_bus_org';
  requiredFields: string[] = [
    'name',
  ];
  pool: Pool;

  constructor(pool: any) {
    super();
    this.pool = pool;
  }

  async create(data: Ministry): Promise<Ministry> {
    const query = {
      text: `
            INSERT INTO ${this.table}
              (name)
              VALUES ($1) RETURNING *;`,
      values: [
        data.name,
      ],
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to create ministry`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async update(ministryId: number, data: Ministry): Promise<Ministry> {
    const values: any[] = [];
    const query = {
      text: `
            UPDATE ${this.table}
              SET
                name = $1
              WHERE id = ${ministryId}
              RETURNING *;`,
      values,
    };

    try {
      const record = await this.findById(ministryId);
      const aData = { ...record, ...data };
      query.values = [
        aData.name,
      ];

      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to update ministry ID ${ministryId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async delete(ministryId: number): Promise<Ministry> {
    const query = {
      text: `
            UPDATE ${this.table}
              SET
                archived = true
              WHERE id = ${ministryId}
              RETURNING *;
          `,
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to archive ministry`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }
}
