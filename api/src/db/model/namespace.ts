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
// Created by Jason Leach on 2020-05-07.
//

import { logger } from '@bcgov/common-nodejs-utils';
import { Pool } from 'pg';
import { projectSetNames } from '../../constants';
import { CommonFields, Model } from './model';
import { QuotaSize } from './quota';

export interface ClusterNamespace extends CommonFields {
  namespaceId: number;
  clusterId: number;
  provisioned: boolean;
  quotaCpuSize: QuotaSize;
  quotaMemorySize: QuotaSize;
  quotaStorageSize: QuotaSize;
}

export interface ProjectNamespace extends CommonFields {
  name: string;
  profileId: number;
  clusters?: ClusterNamespace[];
}

export default class NamespaceModel extends Model {
  table: string = 'namespace';
  requiredFields: string[] = [
    'name',
    'profileId',
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
          (name, profile_id)
          VALUES ($1, $2) RETURNING *;`,
      values: [
        data.name,
        data.profileId,
      ],
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to create namespace`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async update(namespaceId: number, data: ProjectNamespace): Promise<ProjectNamespace> {
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

      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to update namespace ${namespaceId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async delete(namespaceId: number): Promise<ProjectNamespace> {
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
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to archive namespace ${namespaceId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async createProjectSet(profileId: number, clusterId: number, prefix: string,): Promise<ProjectNamespace[]> {
    const query = {
      text: `
        INSERT INTO cluster_namespace
          (namespace_id, cluster_id, quota_cpu_size, quota_memory_size, quota_storage_size)
          VALUES ($1, $2, $3, $3, $3) RETURNING *;`,
      values: [],
    };
    try {
      const names = projectSetNames.map(n => `${prefix}-${n}`);
      const nsPromises = names.map(name => this.create({
        name,
        profileId,
      }));

      const nsResults = await Promise.all(nsPromises);
      // default quota size set to QuotaSize.Small
      const clPromises = nsResults.map(nr => this.runQuery({ ...query, values: [nr.id, clusterId, QuotaSize.Small] }));
      await Promise.all(clPromises);

      return nsResults;
    } catch (err) {
      const message = `Unable to create namespace set`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findForProfile(profileId: number): Promise<ProjectNamespace[]> {
    const query = {
      text: `
        SELECT namespace.id AS "namespaceId", namespace.name,
        coalesce(
          (
            SELECT array_to_json(array_agg(row_to_json(x)))
            FROM (
              SELECT ref_cluster.id AS "clusterId", ref_cluster.name, cluster_namespace.provisioned
              FROM ref_cluster JOIN cluster_namespace ON ref_cluster.id = cluster_namespace.cluster_id
              WHERE namespace.id = cluster_namespace.namespace_id
            ) x
          ),
          '[]'
        ) AS clusters
        FROM namespace WHERE namespace.profile_id = $1;
      `,
      values: [
        profileId,
      ],
    };

    try {
      return await this.runQuery(query);
    } catch (err) {
      const message = `Unable to fetch namespaces for profile ${profileId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async findForNamespaceAndCluster(namespaceId: number, clusterId: number): Promise<ClusterNamespace> {
    const query = {
      text: `
        SELECT * FROM cluster_namespace
          WHERE namespace_id = $1 AND cluster_id = $2;`,
      values: [
        namespaceId, clusterId,
      ],
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to fetch cluster_namespace for namespace ${namespaceId} and cluster ${clusterId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async updateProvisionStatus(namespaceId: number, clusterId: number, provisioned: boolean): Promise<ClusterNamespace> {
    const query = {
      text: `
        UPDATE cluster_namespace
          SET provisioned = $1
          WHERE namespace_id = $2 AND cluster_id = $3
        RETURNING *;`,
      values: [
        provisioned,
        namespaceId,
        clusterId,
      ],
    };

    try {
      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to update provisioning status for namespace ${namespaceId} and cluster ${clusterId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }

  async updateQuotaSize(namespaceId: number, clusterId: number, data: ClusterNamespace): Promise<ClusterNamespace> {
    const values: any[] = [];
    const query = {
      text: `
        UPDATE cluster_namespace
          SET
            quota_cpu_size = $1, quota_memory_size = $2, quota_storage_size = $3
          WHERE namespace_id = ${namespaceId} AND cluster_id = ${clusterId}
        RETURNING *;`,
      values,
    };

    try {
      const record = await this.findForNamespaceAndCluster(namespaceId, clusterId);
      const aData = { ...record, ...data }
      query.values = [
        aData.quotaCpuSize,
        aData.quotaMemorySize,
        aData.quotaStorageSize,
      ];

      const results = await this.runQuery(query);
      return results.pop();
    } catch (err) {
      const message = `Unable to update quota for namespace ${namespaceId} and cluster ${clusterId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
    }
  }
}
