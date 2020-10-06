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
// Created by Jason Leach on 2020-04-28.
//

import { logger } from '@bcgov/common-nodejs-utils';
import { Pool } from 'pg';
import { CommonFields, Model } from './model';

export interface ProjectProfile extends CommonFields {
  name: string,
  description: string,
  busOrgId: number,
  userId: number,
  namespacePrefix: string,
  active?: boolean,
  prioritySystem?: boolean,
  criticalSystem?: boolean,
}

export default class ProfileModel extends Model {
  table: string = 'profile';
  requiredFields: string[] = [
    'name',
    'description',
    'busOrgId',
    'prioritySystem',
    'userId',
    'namespacePrefix',
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
          (name, description, bus_org_id, priority_system,
            critical_system, user_id, namespace_prefix)
          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
      values: [
        data.name,
        data.description,
        data.busOrgId,
        data.prioritySystem ? data.prioritySystem : false,
        data.criticalSystem ? data.criticalSystem : false,
        data.userId,
        data.namespacePrefix,
      ],
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
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
            name = $1, description = $2, bus_org_id = $3,
            active = $4, priority_system = $5, critical_system = $6
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
        aData.busOrgId,
        aData.active,
        aData.criticalSystem,
        aData.prioritySystem,
      ];

      const results = await this.runQuery(query);
      return results.pop();
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
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to archive project profile`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  };

  async addContactToProfile(profileId: number, contactId: number): Promise<void> {
    const values: any[] = [];
    const table = 'profile_contact';
    const query = {
      text: `
        INSERT INTO ${table}
          (profile_id, contact_id)
          VALUES ($1, $2) RETURNING *;`,
      values,
    };

    try {
      query.values = [
        profileId,
        contactId,
      ];

      const results = await this.runQuery(query);

      return results.pop();
    } catch (err) {
      const message = `Unable to link contact ${contactId} to profile ${profileId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async isNamespacePrefixUnique(prefix: string): Promise<boolean> {
    const query = {
      text: `
        SELECT COUNT(*) FROM ${this.table}
          WHERE namespace_prefix = $1;`,
      values: [
        prefix,
      ],
    };

    try {
      const results = await this.runQuery(query);

      return Number(results.pop().count) === 0 ? true : false;
    } catch (err) {
      const message = `Unable to lookup namespace prefix ${prefix}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findProfilesByUserID(id: number): Promise<any> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
          WHERE user_id = $1 AND archived = false;`,
      values: [id],
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to fetch Profile(s) with User ID ${id}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }
}
