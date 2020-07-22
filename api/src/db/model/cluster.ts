import { logger } from '@bcgov/common-nodejs-utils';
import { Pool } from 'pg';
import { CommonFields, Model } from './model';

export interface Cluster extends CommonFields {
  name: string,
  description: string,
  disasterRecovery: boolean,
  onPrem: boolean
}

export default class CusterModel extends Model {
  table: string = 'ref_cluster';
  requiredFields: string[] = [
    'name',
    'description',
    'disasterRecovery',
    'onPrem',
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
          (name, description, disaster_recovery, on_prem)
          VALUES ($1, $2, $3, $4) RETURNING *;`,
      values: [
        data.name,
        data.description,
        data.disasterRecovery,
        data.onPrem,
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

  async update(clusterId: number, data: Cluster): Promise<Cluster> {
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            name = $1, description = $2, disaster_recovery = $3, on_prem = $4
          WHERE id = $5
          RETURNING *;`,
      values: [
        data.name,
        data.description,
        data.disasterRecovery,
        data.onPrem,
        clusterId,
      ]
    };

    try {
      const results = await this.runQuery(query);

      return results.pop();
    } catch (err) {
      const message = `Unable to update cluster ${clusterId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  };

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
  };
}
