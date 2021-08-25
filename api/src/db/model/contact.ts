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

import { logger } from "@bcgov/common-nodejs-utils";
import { Pool } from "pg";
import { CommonFields, Model } from "./model";

export interface Contact extends CommonFields {
  firstName: string;
  lastName: string;
  email: string;
  githubId: string;
  roleId: number;
}

export default class ContactModel extends Model {
  table: string = "contact";

  requiredFields: string[] = ["firstName", "lastName", "email", "roleId"];

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
        data.email.toLowerCase(),
        data.githubId.toLowerCase(),
        data.roleId,
      ],
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = "Unable to create contact";
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findForProject(profileId: number): Promise<Contact[]> {
    const query = {
      text: `
        SELECT contact.id, contact.first_name, contact.last_name, contact.email, contact.github_id, contact.role_id
          FROM contact
          JOIN profile_contact ON contact.id = profile_contact.contact_id
            WHERE profile_contact.profile_id = $1;
      `,
      values: [profileId],
    };

    try {
      return await this.runQuery(query);
    } catch (err) {
      const message = `Unable to fetch contacts for profile ${profileId}`;
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
        aData.email.toLowerCase(),
        aData.githubId.toLowerCase(),
        aData.roleId,
      ];

      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to update contact ID ${contactId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

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
      const message = "Unable to archive contact";
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }
}
