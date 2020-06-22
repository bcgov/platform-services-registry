import { logger } from '@bcgov/common-nodejs-utils';
import { Pool } from 'pg';
import { CommonFields, Model } from './model';

export interface Contact extends CommonFields {
  firstName: string,
  lastName: string,
  email: string,
  githubId: string,
  roleId: number,
}

export default class ContactModel extends Model {
  table: string = 'contact';
  requiredFields: string[] = [
    'firstName',
    'lastName',
    'email',
    'roleId',
  ];
  pool: Pool;

  constructor(pool: any) {
    super();
    this.pool = pool;
  }

  async create(data: Contact): Promise<Contact> {
    const query = {
      text: `
        INSERT INTO ${this.table}
          (first_name, last_name, email, github_id, role_id)
          VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      values: [
        data.firstName,
        data.lastName,
        data.email,
        data.githubId,
        data.roleId,
      ],
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to create contact`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async update(contactId: number, data: Contact): Promise<Contact> {
    const values: any[] = [];
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            first_name = $1, last_name = $2, email = $3, github_id = $4,
            role_id = $5
          WHERE id = ${contactId}
          RETURNING *;`,
      values,
    };

    try {
      const record = await this.findById(contactId);
      const aData = { ...record, ...data };
      query.values = [
        aData.firstName,
        aData.lastName,
        aData.email,
        aData.githubId,
        aData.roleId,
      ];

      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to update contact ID ${contactId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  };

  async delete(contactId: number): Promise<Contact> {
    const query = {
      text: `
        UPDATE ${this.table}
          SET
            archived = true
          WHERE id = ${contactId}
          RETURNING *;
      `,
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to archive contact`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  };
}
