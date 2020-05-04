
import { logger } from '@bcgov/common-nodejs-utils';
import { Pool } from 'pg';
import { transformKeysToCamelCase } from '../utils';

export default abstract class Model {
  abstract table: string;
  abstract requiredFields: string[];
  abstract pool: Pool;

  abstract async create(data: any): Promise<any>;
  abstract async update(profileId: number, data: any): Promise<any>;

  async findAll(): Promise<any[]> {
    const query = {
      text: `SELECT * FROM ${this.table}`,
    };

    try {
      const results = await this.pool.query(query);
      return results.rows.map(r => transformKeysToCamelCase(r));
    } catch (err) {
      const message = `Unable to fetch all Profiles`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findById(id: number): Promise<any[]> {
    const query = {
      text: `SELECT * FROM ${this.table} WHERE id = $1`,
      values: [id],
    };

    try {
      const results = await this.pool.query(query);
      return results.rows.map(r => transformKeysToCamelCase(r)).pop();
    } catch (err) {
      const message = `Unable to fetch Profile with ID ${id}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }
}
