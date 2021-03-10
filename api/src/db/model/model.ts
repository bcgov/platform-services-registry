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
import { transformKeysToCamelCase } from '../utils';

export interface Query {
  text: string;
  values?: any[];
}

export interface CommonFields {
  id?: number;
  archived?: boolean;
  createdAt?: object;
  updatedAt?: object;
}

export abstract class Model {
  abstract table: string;
  abstract requiredFields: string[];
  abstract pool: Pool;

  abstract create(data: any): Promise<any>;
  abstract update(profileId: number, data: any): Promise<any>;
  abstract delete(profileId: number): Promise<any>;

  async findAll(): Promise<any[]> {
    const query = {
      text: `
      SELECT * FROM ${this.table}
        WHERE archived = false;
      `,
    };

    try {
      return await this.runQuery(query);
    } catch (err) {
      const message = `Unable to fetch all Profiles`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findById(id: number): Promise<any> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
          WHERE id = $1 AND archived = false;`,
      values: [id],
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to fetch Profile with ID ${id}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async runQuery(query: Query): Promise<any[]> {
    let client;

    if (this.pool.waitingCount > 0) {
      logger.warn(`Database pool has ${this.pool.waitingCount} waiting queries`);
    }

    try {
      client = await this.pool.connect();
      const results = await client.query(query);

      return results.rows.map(transformKeysToCamelCase);
    } catch (err) {
      throw err;
    } finally {
      client.release();
    }
  }
}
