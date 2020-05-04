import { logger } from '@bcgov/common-nodejs-utils';
import { transformKeysToCamelCase } from '../utils';
import Model from './model';

interface ProjectProfile {
  id?: number,
  name: string,
  description: string,
  category: string,
  busOrgId: string,
  active?: boolean,
  criticalSystem?: boolean,
  createdAt?: object,
  updatedAt?: object,
}

export default class ProfileModel extends Model {
  table: string = 'profile';
  requiredFields: string[] = [
    'name',
    'description',
    'category',
    'busOrgId',
  ];
  pool: any;

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

    // Make sure these are not updated!
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;

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
}
