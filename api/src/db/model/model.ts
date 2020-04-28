
import { logger } from '@bcgov/common-nodejs-utils';
import { Pool } from 'pg';
import { transformKeysToCamelCase } from '../utils';

export default abstract class Model {
  abstract table: string;
  abstract pool: Pool;

  async findAll(): Promise<any[]> {
    let results: any;
    const query = {
      text: `SELECT * FROM ${this.table}`,
    };

    try {
      results = await this.pool.query(query);
    } catch (err) {
      const message = `Unable to fetch all Profiles`;
      logger.error(`${message}, err = ${err.message}`);
    }

    return results.rows.map(r => transformKeysToCamelCase(r));
  }

  async findById(id: number): Promise<any[]> {
    let results: any;
    const query = {
      text: `SELECT * FROM ${this.table} WHERE id = $1`,
      values: [id],
    };

    try {
      results = await this.pool.query(query);
    } catch (err) {
      const message = `Unable to fetch Profile with ID ${id}`;
      logger.error(`${message}, err = ${err.message}`);
    }

    return results.rows.map(r => transformKeysToCamelCase(r));
  }
}
