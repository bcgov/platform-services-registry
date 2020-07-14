import { logger } from '@bcgov/common-nodejs-utils';
import { Pool } from 'pg';
import { CommonFields, Model } from './model';

export interface UserProfile extends CommonFields {
  keycloakId: number;
  lastSeenAt?: object;
}

export default class UserProfileModel extends Model {
  public table: string = 'user_profile';
  requiredFields: string[] = [
    'keycloakId',
  ];
  pool: Pool;

  constructor(pool: any) {
    super();
    this.pool = pool;
  }

  async create(data: UserProfile): Promise<UserProfile> {
    const query = {
      text: `
        INSERT INTO ${this.table}
          (keycloak_id)
          VALUES ($1) RETURNING *;`,
      values: [
        data.keycloakId,
      ],
    };

    try {
      return (await this.runQuery(query)).pop();
    } catch (err) {
      const message = 'Unable to create UserProfile';
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findByKeycloakId(keycloakId): Promise<UserProfile> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
          WHERE keycloak_id = $1;
      `,
      values: [
        keycloakId,
      ],
    };

    try {
      return (await this.runQuery(query)).pop();
    } catch (err) {
      const message = `Unable to fetch UserProfile with ID ${keycloakId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async update(userProfileId, data: UserProfile): Promise<UserProfile> {
    const values: any[] = [];
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            last_seen_at = $1
          WHERE id = $2
          RETURNING *;`,
      values,
    };

    try {
      const record = await this.findById(userProfileId);
      const aData = { ...record, ...data };
      query.values = [
        aData.lastSeenAt,
        userProfileId,
      ];

      return (await this.runQuery(query)).pop();
    } catch (err) {
      const message = `Unable to update UserProfile ${userProfileId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async delete(userProfileId: number): Promise<UserProfile> {
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            archived = true
          WHERE id = $1
          RETURNING *;
      `,
      values: [
        userProfileId,
      ],
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to archive UserProfile`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  };
}
