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

export interface Cluster extends CommonFields {
  name: string;
  description: string;
  disasterRecovery: boolean;
  onPrem: boolean;
  onHardware: boolean;
  isDefault: boolean;
  isProd: boolean;
}

export default class ClusterModel extends Model {
  table: string = 'ref_cluster';
  requiredFields: string[] = [
    'name',
    'description',
    'disasterRecovery',
    'onPrem',
    'onHardware',
    'isProd'
  ];
  pool: Pool;

  constructor(pool: any) {
    super();
    this.pool = pool;
  }

  async create(data: Cluster): Promise<Cluster> {
    const query = {
      text: `
        INSERT INTO ${this.table}
          (name, description, disaster_recovery, on_prem, on_hardware)
          VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      values: [
        data.name,
        data.description,
        data.disasterRecovery,
        data.onPrem,
        data.onHardware,
      ],
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to create cluster`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findDefault(): Promise<Cluster> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
          WHERE is_default = $1 AND archived = false;
      `,
      values: [
        true,
      ],
    };

    try {
      const results = await this.runQuery(query);

      return results.pop();
    } catch (err) {
      const message = `Unable to lookup default cluster`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findByName(name: string): Promise<Cluster> {
    const query = {
      text: `
        SELECT * FROM ${this.table} WHERE name = $1;
      `,
      values: [
        name,
      ],
    };

    try {
      const results = await this.runQuery(query);

      return results.pop();
    } catch (err) {
      const message = `Unable to lookup cluster by name ${name}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findAllProdReady(): Promise<Cluster[]> {
    const query = {
      text: `
        SELECT * FROM ${this.table} WHERE is_prod = $1;
      `,
      values: [
        true,
      ],
    };

    try {
      return await this.runQuery(query);
    } catch (err) {
      const message = `Unable to find all production ready clusters`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async update(clusterId: number, data: Cluster): Promise<Cluster> {
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            name = $1, description = $2, disaster_recovery = $3, on_prem = $4,
            on_hardware = $5,
          WHERE id = $6
          RETURNING *;`,
      values: [
        data.name,
        data.description,
        data.disasterRecovery,
        data.onPrem,
        data.onHardware,
        clusterId,
      ],
    };

    try {
      const results = await this.runQuery(query);

      return results.pop();
    } catch (err) {
      const message = `Unable to update cluster ${clusterId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async delete(clusterId: number): Promise<Cluster> {
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            archived = true
          WHERE id = $1
          RETURNING *;
      `,
      values: [
        clusterId,
      ],
    };

    try {
      const results = await this.runQuery(query);

      return results.pop();
    } catch (err) {
      const message = `Unable to archive cluster`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }
}
