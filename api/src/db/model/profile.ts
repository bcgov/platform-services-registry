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
  prioritySystem?: boolean,
  criticalSystem?: boolean,
  notificationEmail?: boolean,
  notificationSms?: boolean,
  notificationMsTeams?: boolean,
  paymentBambora?: boolean,
  paymentPayBc?: boolean,
  fileTransfer?: boolean,
  fileStorage?: boolean,
  geoMappingWeb?: boolean,
  geoMappingLocation?: boolean,
  schedulingCalendar?: boolean,
  schedulingAppointments?: boolean,
  idmSiteMinder?: boolean,
  idmKeycloak?: boolean,
  idmActiveDir?: boolean,
  other: string,
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
            critical_system, user_id, namespace_prefix,
            notification_email, notification_sms, notification_ms_teams,
            payment_bambora, payment_pay_bc, file_transfer, file_storage,
            geo_mapping_web, geo_mapping_location, scheduling_calendar,
            scheduling_appointments, idm_site_minder,
            idm_keycloak, idm_active_dir,
            other)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
            $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *;`,
      values: [
        data.name.trim(),
        data.description,
        data.busOrgId,
        data.prioritySystem ? data.prioritySystem : false,
        data.criticalSystem ? data.criticalSystem : false,
        data.userId,
        data.namespacePrefix,
        data.notificationEmail ? data.notificationEmail : false,
        data.notificationSms ? data.notificationSms : false,
        data.notificationMsTeams ? data.notificationMsTeams : false,
        data.paymentBambora ? data.paymentBambora : false,
        data.paymentPayBc ? data.paymentPayBc : false,
        data.fileTransfer ? data.fileTransfer : false,
        data.fileStorage ? data.fileStorage : false,
        data.geoMappingWeb ? data.geoMappingWeb : false,
        data.geoMappingLocation ? data.geoMappingLocation : false,
        data.schedulingCalendar ? data.schedulingCalendar : false,
        data.schedulingAppointments ? data.schedulingAppointments : false,
        data.idmSiteMinder ? data.idmSiteMinder : false,
        data.idmKeycloak ? data.idmKeycloak : false,
        data.idmActiveDir ? data.idmActiveDir : false,
        data.other,
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

  async findByPrefix(prefix: string): Promise<ProjectProfile> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
          WHERE namespace_prefix = $1;
      `,
      values: [
        prefix,
      ],
    };

    try {
      const results = await this.runQuery(query);

      return results.pop();
    } catch (err) {
      const message = `Unable to find Profile by prefix ${prefix}`;
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
            priority_system = $4, notification_email = $5, notification_sms = $6,
            notification_ms_teams = $7, payment_bambora = $8, payment_pay_bc = $9, 
            file_transfer = $10, file_storage = $11, geo_mapping_web = $12,
            geo_mapping_location = $13, scheduling_calendar = $14, scheduling_appointments = $15,
            idm_site_minder = $16, idm_keycloak = $17,
            idm_active_dir = $18, other = $19
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
        aData.prioritySystem ? aData.prioritySystem : false,
        aData.notificationEmail ? aData.notificationEmail : false,
        aData.notificationSms ? aData.notificationSms : false,
        aData.notificationMsTeams ? aData.notificationMsTeams : false,
        aData.paymentBambora ? aData.paymentBambora : false,
        aData.paymentPayBc ? aData.paymentPayBc : false,
        aData.fileTransfer ? aData.fileTransfer : false,
        aData.fileStorage ? aData.fileStorage : false,
        aData.geoMappingWeb ? aData.geoMappingWeb : false,
        aData.geoMappingLocation ? aData.geoMappingLocation : false,
        aData.schedulingCalendar ? aData.schedulingCalendar : false,
        aData.schedulingAppointments ? aData.schedulingAppointments : false,
        aData.idmSiteMinder ? aData.idmSiteMinder : false,
        aData.idmKeycloak ? aData.idmKeycloak : false,
        aData.idmActiveDir ? aData.idmActiveDir : false,
        aData.other,
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

  async findProfilesByUserId(id: number): Promise<any> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
          WHERE user_id = $1 AND archived = false;`,
      values: [id],
    };

    try {
      return await this.runQuery(query);
    } catch (err) {
      const message = `Unable to fetch Profile(s) with User Id ${id}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }
}
