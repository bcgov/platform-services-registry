import { logger } from '@bcgov/common-nodejs-utils';
import { Pool } from 'pg';
import { transformKeysToCamelCase } from '../utils';
import { CommonFields, Model } from './model';

type Category = 'pathfinder' | 'operational';

interface ProjectProfile extends CommonFields {
  name: string,
  description: string,
  category: Category,
  busOrgId: string,
  active?: boolean,
  criticalSystem?: boolean,
}

export default class ProfileModel extends Model {
  table: string = 'profile';
  requiredFields: string[] = [
    'name',
    'description',
    'category',
    'busOrgId',
  ];
  pool: Pool;

  constructor(pool: any) {
    super();
    this.pool = pool;
  }

  async create(data: ProjectProfile): Promise<ProjectProfile> {
    const query = {
      text: `
        INSERT INTO ${this.table}
          (name, description, category, bus_org_id)
          VALUES ($1, $2, $3, $4) RETURNING *;`,
      values: [
        data.name,
        data.description,
        data.category,
        data.busOrgId,
      ],
    };

    try {
      const results = await this.pool.query(query);
      return results.rows.map(r => transformKeysToCamelCase(r)).pop();
    } catch (err) {
      const message = `Unable to create project profile`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async update(profileId, data: ProjectProfile): Promise<ProjectProfile> {
    const values: any[] = [];
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            name = $1, description = $2, category = $3, bus_org_id = $4,
            active = $5, critical_system = $6
          WHERE id = ${profileId}
          RETURNING *;`,
      values,
    };

    try {
      const record = await this.findById(profileId);
      const aData = { ...record, ...data };
      query.values = [
        aData.name,
        aData.description,
        aData.category,
        aData.busOrgId,
        aData.active,
        aData.criticalSystem,
      ];
      const results = await this.pool.query(query);
      return results.rows.map(r => transformKeysToCamelCase(r)).pop();
    } catch (err) {
      const message = `Unable to create project profile`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  };

  async delete(profileId): Promise<ProjectProfile> {
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            archived = true
          WHERE id = ${profileId}
          RETURNING *;
      `,
    };

    try {
      const results = await this.pool.query(query);
      return results.rows.map(r => transformKeysToCamelCase(r)).pop();
    } catch (err) {
      const message = `Unable to archive project profile`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  };
}
