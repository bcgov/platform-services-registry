import { logger } from '@bcgov/common-nodejs-utils';
import { transformKeysToCamelCase } from '../utils';
import Model from './model';

interface ProjectProfile {
  name: string,
  description: string,
  category: string,
  busOrgId: string,
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
}
