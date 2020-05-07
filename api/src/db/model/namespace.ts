import { logger } from '@bcgov/common-nodejs-utils';
import { Pool } from 'pg';
import { transformKeysToCamelCase } from '../utils';
import { CommonFields, Model } from './model';

interface ProjectNamespace extends CommonFields {
  name: string,
  profileId: number,
  clusterId: number,
}

export default class NamespaceModel extends Model {
  table: string = 'namespace';
  requiredFields: string[] = [
    'name',
    'profileId',
    'clusterId',
  ];
  pool: Pool;

  constructor(pool: any) {
    super();
    this.pool = pool;
  }

  async create(data: ProjectNamespace): Promise<ProjectNamespace> {
    const query = {
      text: `
        INSERT INTO ${this.table}
          (name, profile_id, cluster_id)
          VALUES ($1, $2, $3) RETURNING *;`,
      values: [
        data.name,
        data.profileId,
        data.clusterId,
      ],
    };

    try {
      const results = await this.pool.query(query);
      return results.rows.map(r => transformKeysToCamelCase(r)).pop();
    } catch (err) {
      const message = `Unable to create namespace`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findForProfile(profileId: number): Promise<ProjectNamespace[]> {
    const query = {
      text: `
      SELECT * FROM ${this.table}
        WHERE profile_id = ${profileId};
      `,
    };

    try {
      const results = await this.pool.query(query);
      return results.rows.map(r => transformKeysToCamelCase(r));
    } catch (err) {
      const message = `Unable to fetch namespaces for profile ${profileId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async update(namespaceId, data: ProjectNamespace): Promise<ProjectNamespace> {
    const values: any[] = [];
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            name = $1, profile_id = $2, cluster_id = $3
          WHERE id = ${namespaceId}
          RETURNING *;`,
      values,
    };

    try {
      const record = await this.findById(namespaceId);
      const aData = { ...record, ...data };
      query.values = [
        aData.name,
        aData.profileId,
        aData.clusterId,
      ];

      const results = await this.pool.query(query);
      return results.rows.map(r => transformKeysToCamelCase(r)).pop();
    } catch (err) {
      const message = `Unable to create namespace`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  };

  async delete(namespaceId): Promise<ProjectNamespace> {
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            archived = true
          WHERE id = ${namespaceId}
          RETURNING *;
      `,
    };

    try {
      const results = await this.pool.query(query);
      return results.rows.map(r => transformKeysToCamelCase(r)).pop();
    } catch (err) {
      const message = `Unable to archive namespace`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  };
}
